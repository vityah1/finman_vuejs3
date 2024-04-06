import SprsService from '../services/sprs.service';
import CategoryService from '../services/CategoryService';

// const currencies = JSON.parse(localStorage.getItem('currencies'));
// const sources = JSON.parse(localStorage.getItem('sources'));
// const categories = JSON.parse(localStorage.getItem('categories'));

// const initialState = user
//     ? { status: { loggedIn: true }, user }
//     : { status: { loggedIn: false }, user: null };

export const sprs = {
    namespaced: true,
    state: {sources: null},
    actions: {
        get_currencies({ commit }) {
            return SprsService.get_currencies().then(
                currencies => {
                    commit('setCurrency', currencies);
                    return Promise.resolve(currencies);
                },
                error => {
                    commit('unSetCurrency');
                    return Promise.reject(error);
                }
            );
        },
        get_categories({ commit }) {
            return CategoryService.getCategories().then(
                categories => {
                    commit('setCategory', categories);
                    return Promise.resolve(categories);
                },
                error => {
                    commit('unSetCategory');
                    console.log(`${error}`);
                    return [];
                }
            );
        },
        get_sources({ commit }) {
            return SprsService.get_sources().then(
                sources => {
                    commit('setSource', sources);
                    return Promise.resolve(sources);
                },
                error => {
                    commit('unSetSource');
                    return Promise.reject(error);
                }
            );
        },                       
    },
    mutations: {
        setSource(state, sources) {
            state.sources = sources;
        },
        unSetSource(state) {
            state.sources = null;
        },
        setCategory(state, categories) {
            state.categories = categories;
        },
        unSetCategory(state) {
            state.categories = null;
        },
        setCurrency(state, currencies) {
            state.currencies = currencies;
        },
        unSetCurrency(state) {
            state.currencies = null;
        },
    }
};