import axios from "axios";

export default axios.create({
    // baseURL: "http://localhost:5000/api",
    baseURL: "https://kt.if.ua/finman_api/api",
    headers: {
        "Content-type": "application/json"
    }
});