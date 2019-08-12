import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Character, Armor, Weapon, Skill} from '../models';
import {
  CharacterRepository,
  WeaponRepository,
  ArmorRepository,
  SkillRepository,
} from '../repositories';

export class UpdateCharacterController {
  constructor(
    @repository(CharacterRepository)
    public characterRepository: CharacterRepository,
    //add following lines
    @repository(WeaponRepository)
    public weaponRepository: WeaponRepository,
    @repository(ArmorRepository)
    public armorRepository: ArmorRepository,
    @repository(SkillRepository)
    public skillRepository: SkillRepository,
  ) {}

  @post('/updatecharacter', {
    responses: {
      '200': {
        description: 'Character model instance',
        content: {'application/json': {schema: getModelSchemaRef(Character)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Character, {exclude: ['id']}),
        },
      },
    })
    character: Omit<Character, 'id'>,
  ): Promise<Character> {
    return this.characterRepository.create(character);
  }

  @get('/updatecharacter/count', {
    responses: {
      '200': {
        description: 'Character model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Character))
    where?: Where<Character>,
  ): Promise<Count> {
    return this.characterRepository.count(where);
  }

  @get('/updatecharacter', {
    responses: {
      '200': {
        description: 'Array of Character model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Character)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Character))
    filter?: Filter<Character>,
  ): Promise<Character[]> {
    return this.characterRepository.find(filter);
  }

  @patch('/updatecharacter', {
    responses: {
      '200': {
        description: 'Character PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Character, {partial: true}),
        },
      },
    })
    character: Character,
    @param.query.object('where', getWhereSchemaFor(Character))
    where?: Where<Character>,
  ): Promise<Count> {
    return this.characterRepository.updateAll(character, where);
  }

  @get('/updatecharacter/{id}', {
    responses: {
      '200': {
        description: 'Character model instance armor, weapon, and skill info',
        content: {},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<any[]> {
    const res: any[] = ['no character', 'no weapon', 'no armor', 'no skill'];
    const filter: Filter = {where: {characterId: id}};
    new Promise<Character>((res, rej) =>
      res(this.characterRepository.findById(id)),
    )
      .then((data: Character) => {
        res[0] = data;
      })
      .catch((err: any) => {
        console.log('error --------------', err);
      });
    const weaponId: Weapon = (await this.weaponRepository.find(filter))[0];
    if (weaponId !== undefined) {
      res[1] = await this.weaponRepository.findById(weaponId.id);
    }
    if ((await this.armorRepository.find(filter))[0] != undefined) {
      res[2] = await this.characterRepository.armor(id).get();
    }
    if ((await this.skillRepository.find(filter))[0] != undefined) {
      res[3] = await this.characterRepository.skill(id).get();
    }
    return res;
  }

  @patch('/updatecharacter/{id}', {
    responses: {
      '204': {
        description: 'Character PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Character, {partial: true}),
        },
      },
    })
    character: Character,
  ): Promise<void> {
    await this.characterRepository.updateById(id, character);
  }

  @put('/updatecharacter/{id}', {
    responses: {
      '204': {
        description: 'Character PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() character: Character,
  ): Promise<void> {
    await this.characterRepository.replaceById(id, character);
  }

  @del('/updatecharacter/{id}', {
    responses: {
      '204': {
        description: 'Character DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    //delete weapon, armor, and skill
    await this.characterRepository.weapon(id).delete();
    await this.characterRepository.armor(id).delete();
    await this.characterRepository.skill(id).delete();
    ///
    await this.characterRepository.deleteById(id);
  }

  @patch('/updatecharacter/{id}/weapon', {
    responses: {
      '200': {
        description: 'update weapon',
        content: {
          'application/json': {
            schema: Weapon,
          },
        },
      },
    },
  })
  async updateWeapon(
    @param.path.string('id') id: string,
    @requestBody() weapon: Weapon,
  ): Promise<Weapon> {
    //equip new weapon
    const char: Character = await this.characterRepository.findById(id);
    char.attack! += weapon.attack;
    char.defence! += weapon.defence;

    //unequip old weapon
    const filter: Filter = {where: {characterId: id}};
    if ((await this.weaponRepository.find(filter))[0] != undefined) {
      const oldWeapon: Weapon = await this.characterRepository.weapon(id).get();
      char.attack! -= oldWeapon.attack; // char.attack! mean not null or undefined if null not compile this line
      char.defence! -= oldWeapon.defence;
      console.log(await this.weaponRepository.find(filter));
      await this.characterRepository.weapon(id).delete();
    }
    await this.characterRepository.updateById(id, char);
    return await this.characterRepository.weapon(id).create(weapon);
  }

  @patch('/updatecharacter/{id}/armor', {
    responses: {
      '200': {
        description: 'update armor',
        content: {
          'application/json': {
            schema: Armor,
          },
        },
      },
    },
  })
  async updateArmor(
    @param.path.string('id') id: string,
    @requestBody() armor: Armor,
  ): Promise<Armor> {
    //equip new weapon
    const char: Character = await this.characterRepository.findById(id);
    char.attack! += armor.attack;
    char.defence! += armor.defence;

    //unequip old weapon
    const filter: Filter = {where: {characterId: id}};
    if ((await this.armorRepository.find(filter))[0] != undefined) {
      const oldArmor: Armor = await this.characterRepository.armor(id).get();
      char.attack! -= oldArmor.attack; // char.attack! mean not null or undefined if null not compile this line
      char.defence! -= oldArmor.defence;
      await this.characterRepository.armor(id).delete();
    }
    await this.characterRepository.updateById(id, char);
    return await this.characterRepository.armor(id).create(armor);
  }

  @patch('/updatecharacter/{id}/skill', {
    responses: {
      '200': {
        description: 'update skill',
        content: {'application/json': {schema: Skill}},
      },
    },
  })
  async updateSkill(
    @param.path.string('id') id: string,
    @requestBody() skill: Skill,
  ): Promise<Skill> {
    await this.characterRepository.skill(id).delete();
    return await this.characterRepository.skill(id).create(skill);
  }

  @del('/updatecharacter/{id}/weapon', {
    responses: {
      '204': {
        description: 'DELETE Weapon',
      },
    },
  })
  async deleteWeapon(@param.path.string('id') id: string): Promise<void> {
    //unequip old weapon
    const filter: Filter = {where: {characterId: id}};
    if ((await this.weaponRepository.find(filter))[0] !== undefined) {
      const oldWeapon: Weapon = await this.characterRepository.weapon(id).get();
      const char: Character = await this.characterRepository.findById(id);
      char.attack! -= oldWeapon.attack!;
      char.defence! -= oldWeapon.defence!;
      await this.characterRepository.weapon(id).delete();
      await this.characterRepository.updateById(id, char);
    }
  }

  @del('/updatecharacter/{id}/armor', {
    responses: {
      '204': {
        description: 'DELETE armor',
      },
    },
  })
  async deleteArmor(@param.path.string('id') id: string): Promise<void> {
    //unequip old weapon
    const filter: Filter = {where: {characterId: id}};
    if ((await this.armorRepository.find(filter))[0] !== undefined) {
      const oldArmor: Armor = await this.characterRepository.armor(id).get();
      const char: Character = await this.characterRepository.findById(id);
      char.attack! -= oldArmor.attack!;
      char.defence! -= oldArmor.defence!;
      await this.characterRepository.armor(id).delete();
      await this.characterRepository.updateById(id, char);
    }
  }

  @del('/updatecharacter/{id}/skill', {
    responses: {
      '204': {
        description: 'DELETE Skill',
      },
    },
  })
  async deleteSkill(@param.path.string('id') id: string): Promise<void> {
    await this.characterRepository.skill(id).delete();
  }

  @patch('/updatecharacter/{id}/levelup', {
    responses: {
      '200': {
        description: 'level up',
        content: {'application/json': {schema: Character}},
      },
    },
  })
  async levelUp(@param.path.string('id') id: string): Promise<Character> {
    const char: Character = await this.characterRepository.findById(id);
    let levels: number = 0;
    while (char.currentExp! >= char.nextLevelExp!) {
      levels++;
      char.currentExp! -= char.nextLevelExp!;
      char.nextLevelExp! += 100;
    }
    char.level! += levels;
    char.maxHealth! += 10 * levels;
    char.currentHealth! = char.maxHealth!;
    char.maxMana! += 5 * levels;
    char.currentMana! = char.maxMana!;
    char.attack! += 3 * levels;
    char.defence! += levels;
    await this.characterRepository!.updateById(id, char);
    return char;
  }
}
