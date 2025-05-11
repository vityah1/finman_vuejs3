import SprsService from '../services/sprs.service';
import CategoryService from '../services/CategoryService';

// Інтерфейси для типізації
interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  is_fuel?: boolean;
  [key: string]: any;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  [key: string]: any;
}

interface Source {
  id: number;
  source: string;
  [key: string]: any;
}

interface SprsState {
  sources: Source[];
  categories: Category[];
  currencies: Currency[];
  selectedCurrency: string;
  categoriesLoaded: boolean;
}

export const sprs = {
  namespaced: true,
  state: {
    sources: [],
    categories: [],
    currencies: [],
    selectedCurrency: localStorage.getItem('selectedCurrency') || 'UAH',
    categoriesLoaded: false,
  } as SprsState,
  actions: {
    updateSelectedCurrency({ commit }: { commit: Function }, currency: string) {
      commit('setSelectedCurrency', currency);
    },
    get_currencies({ commit }: { commit: Function }) {
      return SprsService.get_currencies().then(
        (currencies: any) => {
          commit('setCurrency', currencies);
          return Promise.resolve(currencies);
        },
        (error: any) => {
          commit('unSetCurrency');
          console.error('Помилка завантаження валют:', error.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    },
    get_categories({ commit }: { commit: Function }) {
      return CategoryService.getCategories().then(
        (response: any) => {
          // Перевіряємо, чи є дані в відповіді
          const categories = response.data || [];
          console.log('Отримано категорій:', categories.length);
          commit('setCategory', categories);
          return Promise.resolve(categories);
        },
        (error: any) => {
          commit('unSetCategory');
          console.error('Помилка завантаження категорій:', error.response?.data || error.message);
          return [];
        }
      );
    },
    get_sources({ commit }: { commit: Function }) {
      return SprsService.get_sources().then(
        (sources: any) => {
          commit('setSource', sources);
          return Promise.resolve(sources);
        },
        (error: any) => {
          commit('unSetSource');
          console.error('Помилка завантаження джерел:', error.response?.data || error.message);
          return Promise.reject(error);
        }
      );
    },
  },
  mutations: {
    setSource(state: SprsState, sources: any[]) {
      state.sources = sources;
    },
    unSetSource(state: SprsState) {
      state.sources = null;
    },
    setCategory(state: SprsState, categories: Category[]) {
      state.categories = categories;
      state.categoriesLoaded = true;
    },
    unSetCategory(state: SprsState) {
      state.categories = [];
      state.categoriesLoaded = false;
    },
    setCurrency(state: SprsState, currencies: any[]) {
      state.currencies = currencies;
    },
    unSetCurrency(state: SprsState) {
      state.currencies = null;
    },
    setSelectedCurrency(state: SprsState, currency: string) {
      state.selectedCurrency = currency;
      localStorage.setItem('selectedCurrency', currency);
    },
  }
};
