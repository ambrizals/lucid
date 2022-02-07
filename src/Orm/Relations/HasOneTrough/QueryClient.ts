/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { QueryClientContract, OneOrMany } from '@ioc:Adonis/Lucid/Database'
import { LucidRow } from '@ioc:Adonis/Lucid/Orm'

import { HasOneTrough } from './index'
import { HasOneTroughQueryBuilder } from './QueryBuilder'
import { HasOneTroughSubQueryBuilder } from './SubQueryBuilder'

export class HasOneTroughClient {
  constructor(
    public relation: HasOneTrough,
    private parent: LucidRow,
    private client: QueryClientContract
  ) {}

  /**
   * Generate a related query builder
   */
  public static query(
    client: QueryClientContract,
    relation: HasOneTrough,
    rows: OneOrMany<LucidRow>
  ) {
    const query = new HasOneTroughQueryBuilder(client.knexQuery(), client, rows, relation)
    typeof relation.onQueryHook === 'function' && relation.onQueryHook(query)
    return query
  }

  /**
   * Generate a related eager query builder
   */
  public static eagerQuery(
    client: QueryClientContract,
    relation: HasOneTrough,
    rows: OneOrMany<LucidRow>
  ) {
    const query = new HasOneTroughQueryBuilder(client.knexQuery(), client, rows, relation)

    query.isRelatedPreloadQuery = true
    typeof relation.onQueryHook === 'function' && relation.onQueryHook(query)
    return query
  }

  /**
   * Returns an instance of the sub query
   */
  public static subQuery(client: QueryClientContract, relation: HasOneTrough) {
    const query = new HasOneTroughSubQueryBuilder(client.knexQuery(), client, relation)

    typeof relation.onQueryHook === 'function' && relation.onQueryHook(query)
    return query
  }

  /**
   * Returns an instance of has many through query builder
   */
  public query(): any {
    return HasOneTroughClient.query(this.client, this.relation, this.parent)
  }
}
