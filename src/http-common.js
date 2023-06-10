import axios from "axios";

// const API_URL = window.location.protocol + '//' + process.env.VUE_APP_API_ENDPOINT;
const API_URL = process.env.VUE_APP_API_ENDPOINT;
console.log('http-common API_URL:' +  API_URL);

export default axios.create({
    baseURL: API_URL,
    headers: {
        "Content-type": "application/json"
    }
});