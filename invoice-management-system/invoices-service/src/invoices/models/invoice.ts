class Invoice {
  constructor(
    readonly id: string,
    readonly vendorId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export {Invoice};
