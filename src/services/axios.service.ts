import Axios, { AxiosInstance, AxiosRequestHeaders } from "axios";

export default class ServiceRequest {
  axios: AxiosInstance;
  bearerToken: string;

  constructor() {
    const headers: AxiosRequestHeaders = {
      Accept: "aplication/json",
      "Content-Type": "application/json",
    };

    this.axios = Axios.create({
      baseURL: process.env.BASE_URL,
      headers,
    });

    this.axios.interceptors.request.use(async (config) => ({
      ...config,
      headers:
        config.url === "auth/token"
          ? config.headers
          : {
              ...config.headers,
              Authorization: `bearer ${this.bearerToken}`,
            },
    }));
  }

  async refreshToken() {
    const response = await this.axios.post("auth/token", {
      application: "officialbank-app",
      application_secret: "sssElzQpwz",
    });

    this.bearerToken = response.data.token;
  }

  async getCompany(cnpj: string) {
    return await this.axios.get(`v1/data/empresas/${cnpj}`);
  }
}
