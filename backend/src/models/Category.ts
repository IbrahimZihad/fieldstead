import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface CategoryAttributes {
  id: number;
  name: string;
  slug: string;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, "id">;

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
  }
);
