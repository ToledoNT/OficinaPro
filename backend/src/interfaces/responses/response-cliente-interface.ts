import { IFetchUser } from "../user/fetch-user-interface";

export interface IResponseUser {
  status: boolean;
  code: number;
  message: string;
  data: Array<IFetchUser>;
}