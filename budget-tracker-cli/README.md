# Budget Tracker CLI

Учебное консольное приложение для учёта личных финансов. Все задания тем 2–12 выполнены последовательно в одном проекте. Каждый этап сохранён отдельным коммитом и тегом `topic-NN`; текущая версия соответствует теме 12.

Условия преподавателя сохранены без изменений в [docs/assignments](docs/assignments). [Исходный репозиторий курса](https://github.com/vovachebr/TypeScript-homeworks).

## Запуск последней версии

Из корня репозитория:

```sh
cd budget-tracker-cli
npm install
npm start
```

`npm start` запускает пример из `src/index.ts` через `tsx`: создание счетов и транзакций, частичное обновление транзакции, примеры типов, вывод сводок, проверка декораторов, экспорт CSV и удаление записей. Программа завершается после демонстрации; интерактивное меню в темах 2–12 не требуется.

Сборка и запуск непосредственно в Node.js:

```sh
npm run build
npm run start:compiled
```

После запуска файл `main_account.csv` содержит три транзакции до демонстрационного удаления. Он сохраняется в текущую рабочую папку и исключён из Git.

## Все домашние задания

Нумерация тегов соответствует номеру **темы**, поскольку номер ДЗ в личном кабинете иногда отличается от темы.

| Тема | Условие | Результат этапа | Тег | Запуск после `npm install` и `npm run build` |
| --- | --- | --- | --- | --- |
| 1 | [Настройка](docs/assignments/topic-01.md) | Исходная заготовка проекта | `topic-01` | `npm start` |
| 2 | [Базовые типы](docs/assignments/topic-02.md) | `src/calculation-demo.ts`, пять переменных и вычисления | `topic-02` | `node dist/calculation-demo.js` |
| 3 | [Функции](docs/assignments/topic-03.md) | `src/functions.ts`, пять функций и примеры вызовов | `topic-03` | `node dist/functions.js` |
| 4 | [Интерфейсы и типы](docs/assignments/topic-04.md) | `src/types.ts`, объекты счёта и менеджера без классов | `topic-04` | `npm start` |
| 5 | [Классы](docs/assignments/topic-05.md) | `src/classes.ts`, Transaction, Account, AccountManager | `topic-05` | `npm start` |
| 6 | [Generics](docs/assignments/topic-06.md) | `src/generics.ts`, GenericStorage и Product | `topic-06` | `node dist/generics.js` |
| 7 | [Namespace](docs/assignments/topic-07.md) | Общий BudgetTracker, отдельные файлы, объединение деклараций | `topic-07` | `npm start` |
| 8 | [Declaration files](docs/assignments/topic-08.md) | Модули ES, uuid, moment, собственные `.d.ts` | `topic-08` | `npm start` |
| 9 | [Утилитные типы](docs/assignments/topic-09.md) | Partial, Required, Omit, Pick, Record, ConstructorParameters, InstanceType | `topic-09` | `npm start` |
| 10 | [Асинхронный код](docs/assignments/topic-10.md) | Экспорт CSV, экранирование значений, обработка ошибок | `topic-10` | `npm start` |
| 11 | [Продвинутые типы](docs/assignments/topic-11.md) | Conditional Types и Mapped Types, примеры в index.ts | `topic-11` | `npm start` |
| 12 | [Декораторы](docs/assignments/topic-12.md) | LogClass, LogMethod, ReadOnly, Metadata и reflect-metadata | `topic-12` | `npm start` |

Темы 9 и 10 включены по исходным условиям курса, чтобы сохранить последовательность разработки перед темами 11–12. Тема 1 уже была выполнена в исходном коммите `8204991`.

## Как открыть конкретное ДЗ

Из корня репозитория, например для темы 4:

```sh
git switch --detach topic-04
cd budget-tracker-cli
npm install
npm run build
npm start
```

Возврат к итоговой версии, из корня репозитория:

```sh
git switch master
cd budget-tracker-cli
npm install
npm run build
```

Перед переключением сохраните собственные изменения. После переключения выполняйте `npm install`, поскольку зависимости разных этапов отличаются. Старые варианты `types.ts`, `classes.ts` и решения без классов доступны в соответствующих тегах; их замена в следующих заданиях предусмотрена условиями.

Коммиты и теги созданы локально. После публикации репозитория и тегов на GitHub для сдачи отдельной темы можно использовать ссылку вида `https://github.com/ravenhaha/ts-course/tree/topic-04/budget-tracker-cli`.

## Структура последней версии

```text
src/
├── calculation-demo.ts
├── functions.ts
├── generics.ts
├── interfaces/
│   ├── TransactionType.ts
│   ├── ITransaction.ts
│   ├── IAccount.ts
│   ├── ISummary.ts
│   ├── IAccountManager.ts
│   ├── utility-types.ts
│   └── mapped-types.ts
├── classes/
│   ├── Transaction.ts
│   ├── Account.ts
│   └── AccountManager.ts
├── lib/
│   ├── formatCurrency.js
│   ├── formatCurrency.d.ts
│   ├── budget-utils.js
│   └── budget-utils.d.ts
├── utils/
│   └── escapeCsvValue.ts
├── decorators/
│   ├── LogClass.ts
│   ├── LogMethod.ts
│   ├── ReadOnly.ts
│   └── Metadata.ts
└── index.ts
```

## Противоречия в условиях и принятые решения

- **Тема 4:** до появления класса Account используется IAccount, как в готовом шаблоне задания.
- **Тема 5:** ISummary содержит числовые итоги; название и количество транзакций выводятся через getSummaryString(). Сохранены оба имени getAccounts() и getAllAccounts(), встречающиеся в условиях.
- **Тема 7:** выполнен итоговый чек-лист: namespace BudgetTracker, reference, module: none и outFile. Промежуточный пример с ES-импортами противоречит этому чек-листу. TypeScript закреплён на 5.9.3, поскольку версия 7 удаляет необходимые настройки module: none и outFile. Ранние демонстрации в этом теге собираются отдельно через tsconfig.demos.json.
- **Тема 8:** переход с namespace на модули выполнен явно, как требует подготовка к заданию. Приватное поле _id и публичный getter id позволяют совместить инкапсуляцию с публичным контрактом интерфейсов. В библиотеке реализованы оба варианта имени из условия: formatCurrency и budget-utils. Alias formatCurrency настроен; относительные импорты с .js обеспечивают также запуск сборки непосредственно в Node.js. allowJs копирует JavaScript-библиотеку в dist.
- **Тема 9:** update() обновляет поля данных; идентификатор сохраняется, методы не перезаписываются. Переименование счёта доступно в версиях тем 9–11.
- **Тема 10:** асинхронный экспорт ожидается через await, чтобы ошибки записи попадали в обработчик. Пустой счёт экспортируется с заголовками; экранируются запятые, одинарные и двойные кавычки, CR и LF.
- **Тема 12:** ReadOnly применён к id и name согласно формулировке о защите идентификатора и имени. Проверка переименования в index.ts теперь ожидает ошибку; успешное обновление транзакций сохранено. useDefineForClassFields: false обеспечивает инициализацию свойств через setter декоратора. Описание transactions читается из reflect-metadata в getSummaryString().

## Проверки

```sh
npm test
```

Команда собирает проект, проверяет типы и запускает четыре группы тестов Node.js:

- вычисления, функции и generic-хранилище;
- операции со счетами и транзакциями, сводки и частичное обновление;
- защита свойств разных экземпляров, метаданные и логирование;
- CSV, специальные символы, пустой счёт и ошибка записи.

В tests/typecheck.ts отдельно проверены never для неизвестного ключа, обязательность остальных полей, readonly выбранных полей, IsIncome, утилитные типы и декларации собственной JavaScript-библиотеки. Некорректные примеры помечены @ts-expect-error: проверка завершится ошибкой, если компилятор перестанет их отклонять.
