interface Identifiable {
  id: number;
}

interface Describable {
  describe(): string;
}

class GenericStorage<T extends Identifiable> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  removeById(id: number): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  getById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  describeAll(): void {
    for (const item of this.items) {
      if ("describe" in item && typeof item.describe === "function") {
        console.log(item.describe());
      } else {
        console.log(`Элемент id: ${item.id} не содержит описания.`);
      }
    }
  }
}

class Product implements Identifiable, Describable {
  constructor(public id: number, public name: string, public price: number) {}

  describe(): string {
    return `Product #${this.id}: ${this.name}, price: $${this.price}`;
  }
}

const productStorage = new GenericStorage<Product>();
productStorage.add(new Product(1, "Ноутбук", 150000));
productStorage.add(new Product(2, "Смартфон", 80000));
productStorage.add(new Product(3, "Планшет", 50000));
productStorage.describeAll();
productStorage.add({ id: 4 } as Product);
console.log("После добавления объекта без describe:");
productStorage.describeAll();
console.log("Поиск продукта:", productStorage.getById(1));
console.log("Отсутствующий продукт:", productStorage.getById(99));
const products = productStorage.getAll();
products.pop();
console.log("Изменение копии не меняет хранилище:", productStorage.getAll().length === 4);
console.log("Удаление:", productStorage.removeById(1));
console.log("Повторное удаление:", productStorage.removeById(1));
