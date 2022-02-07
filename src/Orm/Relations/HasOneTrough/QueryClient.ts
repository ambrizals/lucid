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

import { HasOneThrough } from './index'
import { HasOneThroughQueryBuilder } from './QueryBuilder'
import { HasOneThroughSubQueryBuilder } from './SubQueryBuilder'

export class HasOneThroughClient {
  constructor(
    public relation: HasOneThrough,
    private parent: LucidRow,
    private client: QueryClientContract
  ) {}

  /**
   * Generate a related query builder
   */
  public static query(
    client: QueryClientContract,
    relation: HasOneThrough,
    rows: OneOrMany<LucidRow>
  ) {
    const query = new HasOneThroughQueryBuilder(client.knexQuery(), client, rows, relation)
    typeof relation.onQueryHook === 'function' && relation.onQueryHook(query)
    return query
  }

  /**
   * Generate a related eager query builder
   */
  public static eagerQuery(
    client: QueryClientContract,
    relation: HasOneThrough,
    rows: OneOrMany<LucidRow>
  ) {
    const query = new HasOneThroughQueryBuilder(client.knexQuery(), client, rows, relation)

    query.isRelatedPreloadQuery = true
    typeof relation.onQueryHook === 'function' && relation.onQueryHook(query)
    return query
  }

  /**
   * Returns an instance of the sub query
   */
  public static subQuery(client: QueryClientContract, relation: HasOneThrough) {
    const query = new HasOneThroughSubQueryBuilder(client.knexQuery(), client, relation)

    typeof relation.onQueryHook === 'function' && relation.onQueryHook(query)
    return query
  }

  /**
   * Returns an instance of has many through query builder
   */
  public query(): any {
    return HasOneThroughClient.query(this.client, this.relation, this.parent)
  }
}
