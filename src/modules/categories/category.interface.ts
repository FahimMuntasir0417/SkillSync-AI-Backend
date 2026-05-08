export type CreateCategoryInput = {
  name: string;
  description?: string;
  iconUrl?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
