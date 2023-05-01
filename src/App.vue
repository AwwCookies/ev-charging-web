<template>
  <div id="main">
    <div class="toast" v-show="showToast">
      {{ toastMessage }}
    </div>
    <h1>EV Charging App</h1>

    <div id="login" v-show="!token">
      <div>
        <label>Username: </label>
        <input type="text" v-model="username" placeholder="username">
      </div>
      <div>
        <label>Password: </label>
        <input type="password" v-model="password" @keyup.enter="login" placeholder="password">
      </div>
      <button @click="login">Login</button>
    </div>
    
    <!-- Form to add charge -->
    <div id="form" v-show="token">
      <label>Enter charge (kWh): </label>
      <input @click="charge = ''" type="number" v-model="charge" @keyup.enter="addCharge" placeholder="0">
      <div>
        <button @click="addCharge">Add Charge</button>
        <button @click="clear">Reset</button>
      </div>
    </div>
    <!-- Display Charges -->
    <div v-show="token">
      <h2>Charges</h2>
      <!-- Display kWh used and Total Cost -->
      <div>
        <button v-for="month in 12" :key="month" :class="{ active: month === selectedMonth + 1 }"
          @click="selectedMonth = month - 1">
          {{ getMonthName(month - 1).substring(0, 3) }}
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
            <td>{{ formatDate(charge.date) }}</td>
            <td>{{ charge.kWh }} kWh</td>
            <td>${{ (charge.kWh * cost).toFixed(2) }}</td>
            <td>
              <button @click="removeCharge(charge.date)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <div id="price" ref="priceDiv" v-show="token">
      <p @click="isEditCost = true">${{ cost.toFixed(2) }}/kWh</p>
      <div id="edit-cost" v-show="isEditCost">
        <input type="number" v-model="cost" @keyup.enter="isEditCost = false" placeholder="0.10" step="0.01">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { onClickOutside, useLocalStorage } from '@vueuse/core';
import axios from 'axios';
import jwt from '@tsndr/cloudflare-worker-jwt'


const token = useLocalStorage('token', null);
const username = ref('')
const password = ref('')

const charge = ref(0)
const charges = ref([])
const cost = ref(0.10)

const exportTextArea = ref(null);
const showExport = ref(false);

const selectedMonth = ref(new Date().getMonth());

const showToast = ref(false);
const toastMessage = ref('');

const isEditCost = ref(false);

const priceDiv = ref(null);

const login = () => {
  axios.post('/login', {
    username: username.value,
    password: password.value
  }).then((response) => {
    token.value = response.data.token;
    updateCharges();
  }).catch((error) => {
    toastError(error);
  });
};

const updateCharges = () => {
  axios.post('/getCharges', { token: token.value })
    .then((response) => {
      charges.value = response.data;
    })
    .catch((error) => {
      console.log('Error fetching charges:', error);
    });
}


const addCharge = () => {
  // no charge entered or charge is negative
  if (!charge.value || charge.value < 0) {
    toastError('Please enter a valid charge');
    return;
  };

  axios.post('/addCharge', {
    kWh: charge.value,
    token: token.value
  }).then((response) => {
    updateCharges();
    charge.value = null;
  }).catch((error) => {
    toastError(error);
  });
};

const removeCharge = (date) => {
  const confirmed = confirm('Are you sure you want remove this charge?');
  if (!confirmed) return;
  axios.post('/removeCharge', {
    date: date,
    token: token.value
  }).then((response) => {
    updateCharges();
  }).catch((error) => {
    toastError(error);
  });
};

const getCharges = computed(() => {
  const _charges = charges.value;
  return _charges.filter((charge) => {
    const date = new Date(charge.date);
    return date.getMonth() === selectedMonth.value;
  }).reverse();
})


const clear = () => {
  const confirmed = confirm('Are you sure you want to clear all charges?');
  if (!confirmed) return;

  axios.post('/clearCharges', { token: token.value })
    .then((response) => {
      updateCharges();
    })
    .catch((error) => {
      console.log('Error clearing charges:', error);
      toastError('Error clearing charges' + error);
    });
};

const totalCharge = computed(() => {
  const _charges = charges.value;
  return _charges.filter((charge) => {
    const date = new Date(charge.date);
    return date.getMonth() === selectedMonth.value;
  }).reduce((total, charge) => total + charge.kWh, 0);
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

onMounted(() => {
  updateCharges();
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

</script>