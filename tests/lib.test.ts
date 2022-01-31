import { expect } from 'chai'
import 'reflect-metadata'
import {
	use,
	schema,
	prop,
	ref,
	array,
	enums,
	additionalProps,
	anyOf,
} from '../src'

describe('schema', () => {
	//
	it('use non-schema class => must throw TypeError', async () => {
		expect(() => {
			class TestSchema0 {}
			use(TestSchema0)
		}).to.throw(TypeError)
	})

	//
	it('schema with title', async () => {
		@schema({ title: 'TestSchema1' })
		class TestSchema1 {}

		expect(use(TestSchema1)).to.deep.contains({
			type: 'object',
			title: 'TestSchema1',
		})
	})

	//
	it('schema with prop', async () => {
		@schema()
		class TestSchema2 {
			@prop()
			myNumber!: number
		}

		expect(use(TestSchema2)).to.deep.contains({
			type: 'object',
			required: ['myNumber'],
			properties: {
				myNumber: {
					type: 'number',
				},
			},
		})
	})

	//
	it('schema with optional prop', async () => {
		@schema()
		class TestSchema3 {
			@prop({ required: false })
			myNumber?: number
		}

		expect(use(TestSchema3)).to.deep.contains({
			type: 'object',
			required: [],
			properties: {
				myNumber: {
					type: 'number',
				},
			},
		})
	})

	//
	it('schema with multiple prop', async () => {
		@schema()
		class TestSchema4 {
			@prop({ required: false })
			myNumber?: number

			@prop()
			myString!: string
		}

		expect(use(TestSchema4)).to.deep.contains({
			type: 'object',
			required: ['myString'],
			properties: {
				myString: {
					type: 'string',
				},
				myNumber: {
					type: 'number',
				},
			},
		})
	})

	//
	it('schema with ref', async () => {
		@schema()
		class TestSchema5Nested {
			@prop({ required: false })
			myNumber?: number

			@prop()
			myString!: string
		}

		@schema()
		class TestSchema5 {
			@ref(TestSchema5Nested)
			nested!: TestSchema5Nested

			@ref(TestSchema5Nested)
			another!: TestSchema5Nested
		}

		expect(use(TestSchema5)).to.deep.contains({
			type: 'object',
			required: ['nested', 'another'],
			properties: {
				another: {
					type: 'object',
					required: ['myString'],
					properties: {
						myString: {
							type: 'string',
						},
						myNumber: {
							type: 'number',
						},
					},
				},
				nested: {
					type: 'object',
					required: ['myString'],
					properties: {
						myString: {
							type: 'string',
						},
						myNumber: {
							type: 'number',
						},
					},
				},
			},
		})
	})

	//
	it('schema with ref with ref', async () => {
		@schema()
		class TestSchema6NestedNested {
			@prop({ required: false })
			myNumber?: number

			@prop()
			myString!: string
		}

		@schema()
		class TestSchema6Nested {
			@ref(TestSchema6NestedNested)
			nested!: TestSchema6NestedNested
		}

		@schema()
		class TestSchema6 {
			@ref(TestSchema6Nested)
			nested!: TestSchema6Nested
		}

		expect(use(TestSchema6)).to.deep.contains({
			type: 'object',
			required: ['nested'],
			properties: {
				nested: {
					type: 'object',
					required: ['nested'],
					properties: {
						nested: {
							type: 'object',
							required: ['myString'],
							properties: {
								myString: {
									type: 'string',
								},
								myNumber: {
									type: 'number',
								},
							},
						},
					},
				},
			},
		})
	})

	//
	it('schema with array ref', async () => {
		@schema()
		class TestSchema7Nested {
			@prop({ required: false })
			myNumber?: number

			@prop()
			myString!: string
		}

		@schema()
		class TestSchema7 {
			@array()
			@ref(TestSchema7Nested)
			nested!: TestSchema7Nested[]
		}

		expect(use(TestSchema7)).to.deep.contains({
			type: 'object',
			required: ['nested'],
			properties: {
				nested: {
					type: 'array',
					items: {
						type: 'object',
						required: ['myString'],
						properties: {
							myNumber: {
								type: 'number',
							},
							myString: {
								type: 'string',
							},
						},
					},
				},
			},
		})
	})

	//
	it('schema with ref with array props', async () => {
		@schema()
		class TestSchema8Nested {
			@array()
			@prop(Number, { required: false })
			myNumber?: number[]

			@prop()
			myString!: string
		}

		@schema()
		class TestSchema8 {
			@ref(TestSchema8Nested)
			nested!: TestSchema8Nested
		}

		expect(use(TestSchema8)).to.deep.contains({
			type: 'object',
			required: ['nested'],
			properties: {
				nested: {
					type: 'object',
					required: ['myString'],
					properties: {
						myNumber: {
							type: 'array',
							items: {
								type: 'number',
							},
						},
						myString: {
							type: 'string',
						},
					},
				},
			},
		})
	})

	//
	it('schema with ref with array ref', async () => {
		@schema()
		class TestSchema9NestedNested {
			@prop({ required: false })
			myNumber?: number

			@prop()
			myString!: string
		}

		@schema()
		class TestSchema9Nested {
			@array()
			@ref(TestSchema9NestedNested)
			myOtherRef!: TestSchema9NestedNested[]
		}

		@schema()
		class TestSchema9 {
			@ref(TestSchema9Nested)
			myRef!: TestSchema9Nested
		}

		expect(use(TestSchema9)).to.deep.contain({
			type: 'object',
			required: ['myRef'],
			properties: {
				myRef: {
					type: 'object',
					required: ['myOtherRef'],
					properties: {
						myOtherRef: {
							type: 'array',
							items: {
								type: 'object',
								required: ['myString'],
								properties: {
									myNumber: {
										type: 'number',
									},
									myString: {
										type: 'string',
									},
								},
							},
						},
					},
				},
			},
		})
	})

	//
	it('schema with enums', async () => {
		const ENUM = ['a', 'b', 'c'] // value
		type ENUM_T = typeof ENUM[number] // type
		@schema()
		class TestSchema10 {
			@enums(ENUM)
			myEnum!: ENUM_T
		}

		expect(use(TestSchema10)).to.deep.equals({
			type: 'object',
			required: ['myEnum'],
			properties: {
				myEnum: {
					enum: ENUM,
				},
			},
		})
	})

	//
	it('schema with prop (date)', async () => {
		@schema()
		class TestSchema11 {
			@prop()
			myDate!: Date
		}

		expect(use(TestSchema11)).to.deep.equals({
			type: 'object',
			required: ['myDate'],
			properties: {
				myDate: {
					type: 'string',
					format: 'date-time',
					datetime: 'ISO8601',
				},
			},
		})
	})

	it('schema with prop array without type => must throw TypeError', async () => {
		expect(() => {
			@schema()
			class TestSchema12 {
				@array()
				@prop()
				myNumberArray!: number[]
			}
		}).to.throw(TypeError)
	})

	it('schema with array without prop => must thriw TypeError', async () => {
		expect(() => {
			@schema()
			class TestSchema13 {
				@array()
				myNumberArray!: number[]
			}
		}).to.throw(TypeError)
	})

	it('schema with prop (boolean)', async () => {
		@schema()
		class TestSchema14 {
			@prop()
			myBoolean!: boolean
		}

		expect(use(TestSchema14)).to.be.deep.equals({
			type: 'object',
			required: ['myBoolean'],
			properties: {
				myBoolean: {
					type: 'boolean',
				},
			},
		})
	})

	it('schema with optional enums', async () => {
		const e = [1, 2, 3]
		type E = typeof e[number]
		@schema()
		class TestSchema15 {
			@enums(e, { required: false })
			myEnum?: E
		}

		expect(use(TestSchema15)).to.be.deep.equals({
			type: 'object',
			required: [],
			properties: {
				myEnum: {
					enum: e,
				},
			},
		})
	})

	it('schema with inheritance', async () => {
		@schema()
		class TestSchema15Base {
			@prop()
			myNumber!: number
		}

		@schema()
		class TestSchema15 extends TestSchema15Base {
			@prop()
			myString!: string
		}

		expect(
			use(TestSchema15Base),
			'base class should have only own items'
		).to.be.deep.equals({
			type: 'object',
			required: ['myNumber'],
			properties: {
				myNumber: {
					type: 'number',
				},
			},
		})

		expect(
			use(TestSchema15),
			'extends have base plus extends'
		).to.be.deep.equals({
			type: 'object',
			required: ['myNumber', 'myString'],
			properties: {
				myNumber: {
					type: 'number',
				},
				myString: {
					type: 'string',
				},
			},
		})
	})

	it('schema with inheritance with inheritance', async () => {
		@schema()
		class TestSchema16BaseBase {
			@prop()
			myNumber!: number
		}

		@schema()
		class TestSchema16Base extends TestSchema16BaseBase {
			@prop()
			myString!: string
		}

		@schema()
		class TestSchema16 extends TestSchema16Base {
			@prop()
			myBoolean!: boolean
		}

		expect(
			use(TestSchema16BaseBase),
			'base class should have only own items'
		).to.be.deep.equals({
			type: 'object',
			required: ['myNumber'],
			properties: {
				myNumber: {
					type: 'number',
				},
			},
		})

		expect(
			use(TestSchema16Base),
			'extends have base plus extends'
		).to.be.deep.equals({
			type: 'object',
			required: ['myNumber', 'myString'],
			properties: {
				myNumber: {
					type: 'number',
				},
				myString: {
					type: 'string',
				},
			},
		})

		expect(
			use(TestSchema16),
			'extends have base plus extends plus extends'
		).to.be.deep.equals({
			type: 'object',
			required: ['myNumber', 'myString', 'myBoolean'],
			properties: {
				myNumber: {
					type: 'number',
				},
				myString: {
					type: 'string',
				},
				myBoolean: {
					type: 'boolean',
				},
			},
		})
	})

	//
	it('schema with prop with properties', async () => {
		@schema()
		class TestSchema17 {
			@prop()
			myNumber!: number
		}

		expect(use(TestSchema17)).to.deep.contains({
			type: 'object',
			required: ['myNumber'],
			properties: {
				myNumber: {
					type: 'number',
				},
			},
		})
	})

	//
	it('schema with additional properties', async () => {
		class TestSchema18AdditionalProps {
			@prop()
			myNumber!: number

			@prop()
			myString!: string
		}

		@schema()
		class TestSchema18 {
			@additionalProps(TestSchema18AdditionalProps)
			myAdditionalProps!: Record<string, TestSchema18AdditionalProps>
		}
		expect(use(TestSchema18)).to.deep.contains({
			type: 'object',
			required: ['myAdditionalProps'],
			properties: {
				myAdditionalProps: {
					type: 'object',
					additionalProperties: {
						type: 'object',
						required: ['myNumber', 'myString'],
						properties: {
							myNumber: {
								type: 'number',
							},
							myString: {
								type: 'string',
							},
						},
					},
				},
			},
		})
	})

	it('schema with additional properties value', async () => {
		@schema()
		class TestSchema19 {
			@additionalProps(Number)
			myAdditionalProps!: Record<string, number>
		}
		expect(use(TestSchema19)).to.deep.contains({
			type: 'object',
			required: ['myAdditionalProps'],
			properties: {
				myAdditionalProps: {
					type: 'object',
					additionalProperties: {
						type: 'number',
					},
				},
			},
		})
	})

	it('schema with value as nullable', async () => {
		@schema()
		class TestSchema20 {
			@prop(String, { required: true, nullable: true })
			value!: string | null
		}

		// console.log({ TestSchema20: JSON.stringify(use(TestSchema20), null, 4) })

		expect(use(TestSchema20)).to.deep.contains({
			type: 'object',
			properties: {
				value: {
					anyOf: [{ type: 'string' }, { type: 'null' }],
				},
			},
			required: ['value'],
		})
	})

	it('schema with value as nullable optional', async () => {
		@schema()
		class TestSchema21 {
			@prop(String, { nullable: true, required: false })
			value!: string | null
		}

		// console.log({ TestSchema21: JSON.stringify(use(TestSchema21), null, 4) })

		expect(use(TestSchema21)).to.deep.contains({
			type: 'object',
			properties: {
				value: {
					anyOf: [{ type: 'string' }, { type: 'null' }],
				},
			},
			required: [],
		})
	})

	it('schema with value as ref and nullable', async () => {
		@schema()
		class TestSchema22Ref {
			@prop()
			val!: string
		}

		@schema()
		class TestSchema22 {
			@ref(TestSchema22Ref, { nullable: true })
			value!: TestSchema22Ref | null
		}

		// console.log({ TestSchema22: JSON.stringify(use(TestSchema22), null, 4) })

		expect(use(TestSchema22)).to.deep.contains({
			type: 'object',
			properties: {
				value: {
					anyOf: [
						{
							type: 'object',
							properties: { val: { type: 'string' } },
							required: ['val'],
						},
						{ type: 'null' },
					],
				},
			},
			required: ['value'],
		})
	})

	it('schema with value as array ref and nullable', async () => {
		@schema()
		class TestSchema23Ref {
			@prop()
			val!: string
		}

		@schema()
		class TestSchema23 {
			@array({ nullable: true })
			@ref(TestSchema23Ref)
			value!: TestSchema23Ref | null
		}

		// console.log({ TestSchema23: JSON.stringify(use(TestSchema23), null, 4) })

		expect(use(TestSchema23)).to.deep.contains({
			type: 'object',
			properties: {
				value: {
					anyOf: [
						{
							type: 'array',
							items: {
								type: 'object',
								properties: { val: { type: 'string' } },
								required: ['val'],
							},
						},
						{ type: 'null' },
					],
				},
			},
			required: ['value'],
		})
	})
})
