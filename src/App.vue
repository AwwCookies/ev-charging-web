<template>
  <div id="main">
    <div class="toast" v-show="showToast">
      {{ toastMessage }}
    </div>
    <h1>EV Charging App</h1>
    <!-- Form to add charge -->
    <div id="form">
      <label>Enter charge (kWh): </label>
      <input @click="charge = ''" type="number" v-model="charge" @keyup.enter="addCharge" placeholder="0">
      <div>
        <button @click="addCharge">Add Charge</button>
        <button @click="clear">Reset</button>
      </div>
    </div>
    <!-- Display Charges -->
    <div>
      <h2>Charges</h2>
      <!-- Display kWh used and Total Cost -->
      <div>
        <button v-for="month in 12" :key="month" :class="{ active: month === selectedMonth }"
          @click="selectedMonth = month">
          {{ getMonthName(month).substring(0, 3) }}
        </button>
      </div>

      <div id="totals">
        <h3>Energy Used: {{ totalCharge }}kWh | Total Cost: ${{ totalCost }}</h3>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>kWh Used</th>
            <th>Total Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(charge, index) in getCharges" :key="index">
            <td>{{ formatDate(charge.created) }}</td>
            <td>{{ charge.kWh }} kWh</td>
            <td>${{ (charge.kWh * cost).toFixed(2) }}</td>
            <td>
              <button @click="removeCharge(charge.id)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <div id="import-export">
      <button @click="showExport = true">Export</button>
      <button @click="importData">Import</button>
    </div>


    <div id="export" v-show="showExport">
      <textarea ref="exportTextArea" v-model="getExport" readonly>
                      </textarea>
    </div>

    <div id="price" ref="priceDiv">
      <p @click="isEditCost = true">${{ cost.toFixed(2) }}/kWh</p>
      <div id="edit-cost" v-show="isEditCost">
        <input type="number" v-model="cost" @keyup.enter="isEditCost = false" placeholder="0.10" step="0.01">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import PocketBase from 'pocketbase'
import { onClickOutside } from '@vueuse/core';

const pb = new PocketBase('http://localhost:8090')

const email = ref('')
const password = ref('')

const charge = ref(0)
const charges = ref([])
const cost = ref(0.10)

const exportTextArea = ref(null);
const showExport = ref(false);

const selectedMonth = ref(3);

const showToast = ref(false);
const toastMessage = ref('');

const isEditCost = ref(false);

const priceDiv = ref(null);

const login = () => {
  pb.collection('users').authWithPassword(email.value, password.value)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
}

const addCharge = () => {
  // no charge entered or charge is negative
  if (!charge.value || charge.value < 0) {
    toastError('Please enter a valid charge');
    return;
  };

  pb.collection('charges').create({
    kWh: charge.value,
    created: new Date(),
    user: pb.authStore.model.id // add user id to charge
  })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      toastError(err.message);
    })

  charge.value = null;
};

const removeCharge = (id) => {
  const confirmed = confirm('Are you sure you want to remove this charge?');
  if (confirmed) {
    pb.collection('charges').delete(id)
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        toastError(err.message);
      })
  }
};

const getCharges = computed(() => {
  return charges.value.reverse()
})

const clear = () => {
  const confirmed = confirm('Are you sure you want to clear all charges?');
  if (confirmed) {
    charges.value = [];
  }
};

const totalCharge = computed(() => {
  const _charges = charges.value;
  return _charges.reduce((total, charge) => total + charge.kWh, 0);
});

const totalCost = computed(() => {
  return (totalCharge.value * cost.value).toFixed(2);
});

onClickOutside(exportTextArea, () => {
  showExport.value = false;
})

onClickOutside(priceDiv, () => {
  isEditCost.value = false;
})

const formatDate = (_date) => {
  return new Date(_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric'
  });
};

function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber);
  return date.toLocaleString('en-US', { month: 'long' });
}

const toastError = (message) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false
  }, 3000);
};

const refreshChargesCollection = () => {
  pb.collection('charges').getFullList()
    .then((res) => {
      charges.value = res.filter((charge) => {
        const date = new Date(charge.created);
        return date.getMonth() + 1 === selectedMonth.value;
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

watch(selectedMonth, () => {
  charges.value = []
  refreshChargesCollection();
})

onMounted(() => {
  refreshChargesCollection();
})

pb.collection('charges').subscribe('*', (res) => {
  refreshChargesCollection();
})

</script>