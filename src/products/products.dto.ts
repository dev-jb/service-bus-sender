export class ProductDto {
  constructor(
    public id: string,
    public title: string,
    public desc: string,
    public price: number,
    public dateTimeSender: Date,
    public dateTimeReceiver: Date,
  ) {}
}
