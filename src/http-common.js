import axios from "axios";

const API_URL = process.env.VUE_APP_API_ENDPOINT;
console.log('API_URL:' +  API_URL);

export default axios.create({
    // baseURL: "http://127.0.0.1:5000/api",
    // baseURL: "https://kt.if.ua/finman_api/api",
    // baseURL: 'https://site--main--b4xj54d6jsp4.code.run/api',
    baseURL: API_URL,
    headers: {
        "Content-type": "application/json"
    }
});