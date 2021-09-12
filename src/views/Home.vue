<template>
  <div class="info-wrap">
    <form class="info" @submit.prevent="handleSubmit">
    <div
      class="info__item mb-20"
    >
      <vs-select
        v-if="targetOptions.length > 0"
        placeholder='Выберете цель кредита'
        class="max-width"
        v-model="targetValue"
      >
        <vs-option
          v-for="(item, index) in targetOptions"
          :key="index"
          :label="item.label"
          :value="item.value"
        >
          {{ item.label }}
        </vs-option>
      </vs-select>
      <transition name="fade">
        <div
          v-if="isSubmit && !targetValue"
          class="error-message"
        >
          Это обязательное поле
        </div>
      </transition>
    </div>
    <div class="info__item mb-50">
      <vs-checkbox
        v-model="isSalaryCard"
      >
        Есть зарплатная карта
      </vs-checkbox>
    </div>
    <div class="info__item mb-50">
      <custom-slider
        :min="housingCostData.min"
        :max="housingCostData.max"
        :step="housingCostData.step"
        v-model="housingCost"
        class="mb-20"
      />
      <div class="info__item-details">
        Стоимость жилья: {{ housingCost }} ₽
      </div>
    </div>
    <div class="info__item mb-50">
      <custom-slider
        :min="initialFeeData.min"
        :max="initialFeeData.max"
        :step="initialFeeData.step"
        v-model="initialFee"
        class="mb-20"
      />
      <div class="info__item-details">
        Первоначальный взнос: {{ initialFee }} ₽
      </div>
      <transition name="fade">
        <div
          v-if="isInitialError"
          class="error-message"
        >
          Взнос не должен превышать стоимость жилья
        </div>
      </transition>
    </div>
    <div class="info__item mb-50">
      <custom-slider
        :min="creditTermData.min"
        :max="creditTermData.max"
        :step="'1'"
        v-model="creditTerm"
        class="mb-20"
      />
      <div class="info__item-details">
        Срок кредита: {{ creditTerm }} {{ creditTerm | yearFilter }}
      </div>
    </div>
    <vs-button
     type="submit"
    >
      График платежей
    </vs-button>
  </form>
    <vs-dialog v-model="isShown">
      <template #header>
        <h3>График Платежей</h3>
      </template>
      <vs-table striped>
        <template #thead>
          <vs-tr>
            <vs-th>Год</vs-th>
            <vs-th class='text-center'>Сума платежа</vs-th>
            <vs-th class='text-center'>Погашение процентов</vs-th>
            <vs-th class='text-center'>Погашение основного долга</vs-th>
            <vs-th class='text-center'>Остаток долга</vs-th>
          </vs-tr>
        </template>
        <template #tbody>
          <vs-tr
            :key="i"
            v-for="(tr, i) in paymentData"
            :data="tr"
          >
            <vs-td>{{ tr.year }}</vs-td>
            <vs-td>
              {{ tr.paymentAmount }}
            </vs-td>
            <vs-td>
              {{ tr.percentPay }}
            </vs-td>
            <vs-td>
              {{ tr.debtPay }}
            </vs-td>
            <vs-td>
              {{ tr.remainder }}
            </vs-td>
          </vs-tr>
        </template>
      </vs-table>
    </vs-dialog>
  </div>
</template>

<script lang="ts">
import CustomSlider from "vue-custom-range-slider";
import "vue-custom-range-slider/dist/vue-custom-range-slider.css";
import { Component, Vue, Watch } from 'vue-property-decorator';
import { generatePayment, addPercent, subtractPercent } from '@/utils/index.ts'
type PaymentItem = {
  year: number,
  paymentAmount: number,
  percentPay: number,
  debtPay: number,
  remainder: number
}
@Component({
  name: 'App',
  components: {
    CustomSlider
  }
})
export default class Home extends Vue {
  targetValue = '';
  targetOptions = [];
  isSalaryCard = false;
  initialFee = '0';
  housingCost = '0';
  creditTerm ='0';
  betSize = 0;

  initialFeeData = {};
  housingCostData = {};
  creditTermData = {};
  salaryCardDivider = 0;

  isSubmit = false;
  isInitialError = false;
  isShown = false;
  paymentData = null as null | Array<PaymentItem>;

  checkPriceValue(): void {
    if (+this.initialFee < +this.housingCost ) {
      this.isInitialError = false;
    }
  }

  addPercentForBetSize(percent: number) {
    this.betSize = addPercent(this.betSize, +percent)
  }
  subtractPercentForBetSize(percent: number) {
    this.betSize = subtractPercent(this.betSize, +percent)
  }

  handleSubmit():void {
    this.isSubmit = true;
    let isError = false;
    if (!this.targetValue) {
      isError = true;
    }
    if (+this.initialFee > +this.housingCost) {
      this.isInitialError = true;
      isError = true;
    }

    if (!isError) {
      this.isShown = true;
      this.betSize = +this.housingCost;
      this.isSalaryCard
          ? this.subtractPercentForBetSize(this.salaryCardDivider)
          : this.addPercentForBetSize(this.salaryCardDivider)
      this.betSize = this.betSize - +this.initialFee
      this.paymentData = generatePayment(
          +this.housingCost - +this.initialFee,
          this.betSize, +this.creditTerm
      )
    }
  }
  @Watch('initialFee', )
  initialFeeValue(): void {
   this.checkPriceValue();
  }

  @Watch('housingCost')
  housingFeeValue(): void {
   this.checkPriceValue();
  }

  async mounted() {
    try {
      const initialValues = await this.$store.dispatch('getFinanceData')
      const { target, salaryCardDivider, housingCost, initialFee, creditTerm } = initialValues.data
      this.targetOptions = target
      this.salaryCardDivider = salaryCardDivider
      this.housingCost = housingCost
      this.initialFeeData = initialFee
      this.housingCostData = housingCost
      this.creditTermData = creditTerm

      this.initialFee = initialFee.min
      this.housingCost = housingCost.min
      this.creditTerm = creditTerm.min
    } catch(e) {
      console.log(e);
    }
  }
}
</script>
