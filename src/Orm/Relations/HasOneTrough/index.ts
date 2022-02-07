/*
 * @adonisjs/lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { QueryClientContract, OneOrMany } from '@ioc:Adonis/Lucid/Database'
import {
  LucidRow,
  LucidModel,
  ThroughRelationOptions,
  HasOneThrough as ModelHasOneThrough,
  HasOneThroughRelationContract,
} from '@ioc:Adonis/Lucid/Orm'

import { KeysExtractor } from '../KeysExtractor'
import { ensureRelationIsBooted } from '../../../utils'
import { HasOneThroughClient } from './QueryClient'

/**
 * Manages loading and persisting has many through relationship
 */
export class HasOneThrough implements HasOneThroughRelationContract<LucidModel, LucidModel> {
  public type = 'hasOneThrough' as const

  public booted: boolean = false

  public serializeAs =
    this.options.serializeAs === undefined ? this.relationName : this.options.serializeAs

  public throughModel = this.options.throughModel

  /**
   * Available after boot is invoked
   */
  public localKey: string
  public localKeyColumnName: string

  /**
   * This exists on the through model
   */
  public foreignKey: string
  public foreignKeyColumnName: string

  /**
   * This exists on the through model
   */
  public throughLocalKey: string
  public throughLocalKeyColumnName: string

  /**
   * This exists on the related model
   */
  public throughForeignKey: string
  public throughForeignKeyColumnName: string

  /**
   * Reference to the onQuery hook defined by the user
   */
  public onQueryHook = this.options.onQuery

  constructor(
    public relationName: string,
    public relatedModel: () => LucidModel,
    private options: ThroughRelationOptions<ModelHasOneThrough<LucidModel>> & {
      throughModel: () => LucidModel
    },
    public model: LucidModel
  ) {}

  /**
   * Clone relationship instance
   */
  public clone(parent: LucidModel): any {
    return new HasOneThrough(this.relationName, this.relatedModel, { ...this.options }, parent)
  }

  /**
   * Returns the alias for the through key
   */
  public throughAlias(key: string): string {
    return `through_${key}`
  }

  /**
   * Boot the relationship and ensure that all keys are in
   * place for queries to do their job.
   */
  public boot() {
    if (this.booted) {
      return
    }

    /**
     * Extracting keys from the model and the relation model. The keys
     * extractor ensures all the required columns are defined on
     * the models for the relationship to work
     */
    const { localKey, foreignKey, throughLocalKey, throughForeignKey } = new KeysExtractor(
      this.model,
      this.relationName,
      {
        localKey: {
          model: this.model,
          key:
            this.options.localKey ||
            this.model.namingStrategy.relationLocalKey(
              this.type,
              this.model,
              this.relatedModel(),
              this.relationName
            ),
        },
        foreignKey: {
          model: this.throughModel(),
          key:
            this.options.foreignKey ||
            this.model.namingStrategy.relationForeignKey(
              this.type,
              this.model,
              this.throughModel(),
              this.relationName
            ),
        },
        throughLocalKey: {
          model: this.throughModel(),
          key:
            this.options.throughLocalKey ||
            this.model.namingStrategy.relationLocalKey(
              this.type,
              this.throughModel(),
              this.relatedModel(),
              this.relationName
            ),
        },
        throughForeignKey: {
          model: this.relatedModel(),
          key:
            this.options.throughForeignKey ||
            this.model.namingStrategy.relationForeignKey(
              this.type,
              this.throughModel(),
              this.relatedModel(),
              this.relationName
            ),
        },
      }
    ).extract()

    /**
     * Keys on the parent model
     */
    this.localKey = localKey.attributeName
    this.localKeyColumnName = localKey.columnName

    /**
     * Keys on the through model
     */
    this.foreignKey = foreignKey.attributeName
    this.foreignKeyColumnName = foreignKey.columnName

    this.throughLocalKey = throughLocalKey.attributeName
    this.throughLocalKeyColumnName = throughLocalKey.columnName

    this.throughForeignKey = throughForeignKey.attributeName
    this.throughForeignKeyColumnName = throughForeignKey.columnName

    /**
     * Booted successfully
     */
    this.booted = true
  }

  /**
   * Set related model instances
   */
  public setRelated(parent: LucidRow, related: LucidRow | null): void {
    ensureRelationIsBooted(this)
    parent.$setRelated(this.relationName, related)
  }

  /**
   * Push related model instance(s)
   */
  public pushRelated(parent: LucidRow, related: LucidRow | LucidRow[]): void {
    ensureRelationIsBooted(this)
    parent.$pushRelated(this.relationName, related)
  }

  /**
   * Finds and set the related model instances next to the parent
   * models.
   */
  public setRelatedForMany(parent: LucidRow[], related: LucidRow[]): void {
    ensureRelationIsBooted(this)

    parent.forEach((parentModel) => {
      const match = related.find((relatedModel) => {
        const value = parentModel[this.localKey]
        return value !== undefined && value === relatedModel[this.foreignKey]
      })

      this.setRelated(parentModel, match || null)
    })
  }

  /**
   * Returns an instance of query client for invoking queries
   */
  public client(parent: LucidRow, client: QueryClientContract): any {
    ensureRelationIsBooted(this)
    return new HasOneThroughClient(this, parent, client)
  }

  /**
   * Returns instance of the eager query
   */
  public eagerQuery(parent: OneOrMany<LucidRow>, client: QueryClientContract) {
    ensureRelationIsBooted(this)
    return HasOneThroughClient.eagerQuery(client, this, parent)
  }

  /**
   * Returns instance of query builder
   */
  public subQuery(client: QueryClientContract) {
    ensureRelationIsBooted(this)
    return HasOneThroughClient.subQuery(client, this)
  }
}
