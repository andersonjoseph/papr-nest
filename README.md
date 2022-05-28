# Papr-Nest

<div align="center">
	<img alt="Papr" height="125" src="https://i.imgur.com/E5013gS.png" />
</div>

---

- TypeScript-safe schemas
- JSON Schema MongoDB validation
- :tada: Lightweight library
- :rocket: Blazing fast

---

[`papr`](https://github.com/plexinc/papr) is a lightweight library built around the MongoDB NodeJS driver, written in TypeScript.

[`papr`](https://github.com/plexinc/papr) uses MongoDB's [JSON Schema validation](https://docs.mongodb.com/manual/core/schema-validation/#json-schema) feature to enable validation of document writes at runtime (requires MongoDB 3.6+).

[`papr`](https://github.com/plexinc/papr) has a familiar API - if you have used the raw `mongodb` methods to query and change documents before, then you already know how to use `papr`.

## Sample code


```ts
//user.module.ts
import {Field, Model} from 'papr-nest';

@Model()
export default class User {
  @Field()
  age: number

  @Field({required: true})
  firstName: string

  @Field({required: true})
  lastName: string
}
```

```ts
// app.module.ts
import { PaprModule } from 'papr-nest';
import User from './user/user.model';

@Module({
  imports: [
    PaprModule.forRoot({
      connectionString: process.env.MONGO_URI,
      models: [User],
      // you can also use a glob:
      models: 'src/**/*.model.ts',
    }),
    PhotoModule,
  ],
})
export class ApplicationModule {}
```

```ts
// user.service..ts
import { getPaprRepositoryToken, PaprRepository } from 'papr-nest';
import User from './user.model';

@Injectable()
export class UserService {
  constructor(
    @Inject(getPaprRepositoryToken(User))
    private readonly userRepository: PaprRepository<User>,
  ) {}
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({});
  }

  async create(): Promise<User> {
    const newUser = await this.userRepository.insertOne({
      age: 18,
      firstName: 'Elliot',
      lastName: 'Alderson'
    });

    return newUser;
  }
}

```

## Inspiration

- [Papr](https://github.com/plexinc/papr)
- [Mongoose](https://mongoosejs.com/)
- [ts-mongoose](https://github.com/lstkz/ts-mongoose)
