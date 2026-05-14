import { createStore } from "vuex";

const store = createStore({
  state: {
    userInfo: null,
    shopInfo: null,
    activities: [],
    customers: []
  },
  mutations: {
    SET_USER_INFO(state, info) {
      state.userInfo = info;
    },
    SET_SHOP_INFO(state, info) {
      state.shopInfo = info;
    },
    SET_ACTIVITIES(state, list) {
      state.activities = list;
    },
    ADD_ACTIVITY(state, activity) {
      state.activities.unshift(activity);
    },
    UPDATE_ACTIVITY(state, { id, data }) {
      const idx = state.activities.findIndex((a) => a._id === id);
      if (idx > -1) {
        state.activities.splice(idx, 1, { ...state.activities[idx], ...data });
      }
    },
    SET_CUSTOMERS(state, list) {
      state.customers = list;
    },
    ADD_CUSTOMER(state, customer) {
      state.customers.unshift(customer);
    },
    UPDATE_CUSTOMER(state, { id, data }) {
      const idx = state.customers.findIndex((c) => c._id === id);
      if (idx > -1) {
        state.customers.splice(idx, 1, { ...state.customers[idx], ...data });
      }
    }
  },
  getters: {
    hasShop: (state) => !!state.shopInfo && !!state.shopInfo.name,
    activeActivities: (state) => state.activities.filter((a) => a.status === "active"),
    customerCount: (state) => state.customers.length
  }
});

export default store;