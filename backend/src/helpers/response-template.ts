export abstract class ResponseTemplate {
  status: boolean;
  code: number;
  message: string;

  constructor(value: any) {
    this.status = value?.status ?? true;
    this.code = value?.code ?? 200;
    this.message = value?.message ?? "";
  }

  public formatValues(value: any) {}
}