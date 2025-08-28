import { IFetchUser } from "../../interfaces/user/fetch-user-interface";

export class FetchUserModel implements IFetchUser {
  id: string;
  user: string;
  password: string;

  constructor(value: IFetchUser) {
    this.id = value.id ?? "";
    this.user = value.user ?? "";
    this.password = value.password ?? "";
  }
}