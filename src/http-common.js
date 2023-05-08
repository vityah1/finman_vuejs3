import axios from "axios";

export default axios.create({
    // baseURL: "http://127.0.0.1:5000/api",
    // baseURL: "https://kt.if.ua/finman_api/api",
    baseURL: 'https://site--main--b4xj54d6jsp4.code.run/api',
    headers: {
        "Content-type": "application/json"
    }
});