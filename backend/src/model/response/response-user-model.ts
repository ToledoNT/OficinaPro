import { ResponseTemplate } from "../../helpers/response-template";
import { FetchUserModel } from "../user/response-cliente-model";
import { IFetchUser } from "../../interfaces/user/fetch-user-interface";

export class ResponseUserModel extends ResponseTemplate {
  data: Array<IFetchUser>;
  constructor(value: any) {
    super(value);
    this.data = this.formatValues(value?.data);
  }
  formatValues(value: any): Array<IFetchUser> {
    const valuesList = Array<IFetchUser>();
    if (Array.isArray(value) && value.length > 0) {
      for (const data of value) {
        const valueFormated = new FetchUserModel(data);
        valuesList.push(valueFormated);
      }
    } else {
      const valueFormated = new FetchUserModel(value);
      valuesList.push(valueFormated);
    }
    return valuesList;
  }
}