import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import { API_BASE_URL } from '../config';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    cartProducts: [],
    userAccessKey: null,
    cartProductsData: [],
  },

  mutations: {
    addProductToCart(state, { productId, amount, product }) {
      console.log('cartProducts - ', state.cartProducts);
      const item = state.cartProducts.find((i) => i.productId === productId);
      console.log(item);
      if (item) {
        item.amount += amount;
      } else {
        state.cartProducts.push({
          productId,
          amount,
        });
        state.cartProductsData.push({ product });
      }
    },

    updateCartProductAmount(state, { productId, amount }) {
      const item = state.cartProducts.find((i) => i.productId === productId);

      if (item) {
        item.amount = amount;
      }
    },

    deleteCartProduct(state, productId) {
      state.cartProducts = state.cartProducts.filter((item) => item.productId !== productId);
    },

    updateUserAccessKey(state, accessKey) {
      state.userAccessKey = accessKey;
    },

    updateCartProductsData(state, items) {
      state.cartProductsData.push(...items);
    },
    syncCartProducts(state) {
      state.cartProducts = state.cartProductsData.map((item) => ({
        productId: item.product.id,
        amount: item.quantity,
      }));
    },

  },
  getters: {
    cartDetailProducts(state) {
      return state.cartProducts.map((item) => {
        const { product } = state.cartProductsData.find(
          (p) => p.product.id === item.productId,
        );
        return {
          ...item,
          product,
        };
      });
    },

    cartTotalPrice(state, getters) {
      return getters.cartDetailProducts.reduce(
        (acc, item) => (item.product.price * item.amount) + acc,
        0,
      );
    },

    cartTotalProducts(state) {
      return state.cartProducts.reduce(
        (acc, item) => (item.amount) + acc,
        0,
      );
    },

  },
  actions: {
    loadCart(context) {
      axios
        .get(`${API_BASE_URL}/api/baskets`, {
          params: {
            userAccessKey: context.state.userAccessKey,
          },
        })
        .then((response) => {
          if (!context.state.userAccessKey || context.state.userAccessKey === 'undefined') {
            localStorage.setItem('userAccessKey', response.data.user.accessKey);
            context.commit('updateUserAccessKey', response.data.user.accessKey);
          }
          context.commit('updateCartProductsData', response.data.items);
          context.commit('syncCartProducts');
        });
    },
  },
});
