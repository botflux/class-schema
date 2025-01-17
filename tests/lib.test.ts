import { expect } from "chai";
import "reflect-metadata";
import {
	use,
	schema,
	prop,
	ref,
	array,
	enums,
	additionalProps,
	useAnyOf,
	useOneOf,
	oneOf,
	anyOf,
	allOf,
	consts,
	useEnum,
	useArray,
} from "../src";

describe("schema", () => {
	//
	it("use non-schema class => must throw TypeError", async () => {
		expect(() => {
			class TestSchema0 {}
			use(TestSchema0);
		}).to.throw(TypeError);
	});

	//
	it("schema with title", async () => {
		@schema({ title: "TestSchema1" })
		class TestSchema1 {}

		expect(use(TestSchema1)).to.deep.contains({
			type: "object",
			title: "TestSchema1",
		});
	});

	//
	it("schema with prop", async () => {
		@schema()
		class TestSchema2 {
			@prop()
			myNumber!: number;
		}

		expect(use(TestSchema2)).to.deep.contains({
			type: "object",
			required: ["myNumber"],
			properties: {
				myNumber: {
					type: "number",
				},
			},
		});
	});

	//
	it("schema with optional prop", async () => {
		@schema()
		class TestSchema3 {
			@prop({ required: false })
			myNumber?: number;
		}

		expect(use(TestSchema3)).to.deep.contains({
			type: "object",
			required: [],
			properties: {
				myNumber: {
					type: "number",
				},
			},
		});
	});

	//
	it("schema with multiple prop", async () => {
		@schema()
		class TestSchema4 {
			@prop({ required: false })
			myNumber?: number;

			@prop()
			myString!: string;
		}

		expect(use(TestSchema4)).to.deep.contains({
			type: "object",
			required: ["myString"],
			properties: {
				myString: {
					type: "string",
				},
				myNumber: {
					type: "number",
				},
			},
		});
	});

	//
	it("schema with ref", async () => {
		@schema()
		class TestSchema5Nested {
			@prop({ required: false })
			myNumber?: number;

			@prop()
			myString!: string;
		}

		@schema()
		class TestSchema5 {
			@ref(TestSchema5Nested)
			nested!: TestSchema5Nested;

			@ref(TestSchema5Nested)
			another!: TestSchema5Nested;
		}

		expect(use(TestSchema5)).to.deep.contains({
			type: "object",
			required: ["nested", "another"],
			properties: {
				another: {
					type: "object",
					description: "TestSchema5Nested",
					title: "TestSchema5Nested",
					required: ["myString"],
					properties: {
						myString: {
							type: "string",
						},
						myNumber: {
							type: "number",
						},
					},
				},
				nested: {
					type: "object",
					description: "TestSchema5Nested",
					title: "TestSchema5Nested",
					required: ["myString"],
					properties: {
						myString: {
							type: "string",
						},
						myNumber: {
							type: "number",
						},
					},
				},
			},
		});
	});

	//
	it("schema with ref with ref", async () => {
		@schema()
		class TestSchema6NestedNested {
			@prop({ required: false })
			myNumber?: number;

			@prop()
			myString!: string;
		}

		@schema()
		class TestSchema6Nested {
			@ref(TestSchema6NestedNested)
			nested!: TestSchema6NestedNested;
		}

		@schema()
		class TestSchema6 {
			@ref(TestSchema6Nested)
			nested!: TestSchema6Nested;
		}

		expect(use(TestSchema6)).to.deep.contains({
			type: "object",
			required: ["nested"],
			properties: {
				nested: {
					type: "object",
					title: "TestSchema6Nested",
					description: "TestSchema6Nested",
					required: ["nested"],
					properties: {
						nested: {
							type: "object",
							title: "TestSchema6NestedNested",
							description: "TestSchema6NestedNested",
							required: ["myString"],
							properties: {
								myString: {
									type: "string",
								},
								myNumber: {
									type: "number",
								},
							},
						},
					},
				},
			},
		});
	});

	//
	it("schema with array ref", async () => {
		@schema()
		class TestSchema7Nested {
			@prop({ required: false })
			myNumber?: number;

			@prop()
			myString!: string;
		}

		@schema()
		class TestSchema7 {
			@array()
			@ref(TestSchema7Nested)
			nested!: TestSchema7Nested[];
		}

		expect(use(TestSchema7)).to.deep.contains({
			type: "object",
			required: ["nested"],
			properties: {
				nested: {
					type: "array",
					items: {
						type: "object",
						title: "TestSchema7Nested",
						description: "TestSchema7Nested",
						required: ["myString"],
						properties: {
							myNumber: {
								type: "number",
							},
							myString: {
								type: "string",
							},
						},
					},
				},
			},
		});
	});

	//
	it("schema with ref with array props", async () => {
		@schema()
		class TestSchema8Nested {
			@array()
			@prop(Number, { required: false })
			myNumber?: number[];

			@prop()
			myString!: string;
		}

		@schema()
		class TestSchema8 {
			@ref(TestSchema8Nested)
			nested!: TestSchema8Nested;
		}

		expect(use(TestSchema8)).to.deep.contains({
			type: "object",
			required: ["nested"],
			properties: {
				nested: {
					type: "object",
					title: "TestSchema8Nested",
					description: "TestSchema8Nested",
					required: ["myString"],
					properties: {
						myNumber: {
							type: "array",
							items: {
								type: "number",
							},
						},
						myString: {
							type: "string",
						},
					},
				},
			},
		});
	});

	//
	it("schema with ref with array ref", async () => {
		@schema()
		class TestSchema9NestedNested {
			@prop({ required: false })
			myNumber?: number;

			@prop()
			myString!: string;
		}

		@schema()
		class TestSchema9Nested {
			@array()
			@ref(TestSchema9NestedNested)
			myOtherRef!: TestSchema9NestedNested[];
		}

		@schema()
		class TestSchema9 {
			@ref(TestSchema9Nested)
			myRef!: TestSchema9Nested;
		}

		expect(use(TestSchema9)).to.deep.contain({
			type: "object",
			required: ["myRef"],
			properties: {
				myRef: {
					type: "object",
					title: "TestSchema9Nested",
					description: "TestSchema9Nested",
					required: ["myOtherRef"],
					properties: {
						myOtherRef: {
							type: "array",
							items: {
								type: "object",
								title: "TestSchema9NestedNested",
								description: "TestSchema9NestedNested",
								required: ["myString"],
								properties: {
									myNumber: {
										type: "number",
									},
									myString: {
										type: "string",
									},
								},
							},
						},
					},
				},
			},
		});
	});

	//
	it("schema with enums", async () => {
		const ENUM = ["a", "b", "c"]; // value
		type ENUM_T = typeof ENUM[number]; // type
		@schema()
		class TestSchema10 {
			@enums(ENUM)
			myEnum!: ENUM_T;
		}

		expect(use(TestSchema10)).to.deep.equals({
			type: "object",
			title: "TestSchema10",
			description: "TestSchema10",
			required: ["myEnum"],
			properties: {
				myEnum: {
					type: "string",
					enum: ENUM,
				},
			},
		});
	});

	//
	it("schema with prop (date)", async () => {
		@schema()
		class TestSchema11 {
			@prop()
			myDate!: Date;
		}

		expect(use(TestSchema11)).to.deep.equals({
			type: "object",
			required: ["myDate"],
			title: "TestSchema11",
			description: "TestSchema11",
			properties: {
				myDate: {
					type: "string",
					format: "date-time",
					datetime: "ISO8601",
				},
			},
		});
	});

	it("schema with prop array without type => must throw TypeError", async () => {
		expect(() => {
			@schema()
			class TestSchema12 {
				@array()
				@prop()
				myNumberArray!: number[];
			}
		}).to.throw(TypeError);
	});

	it("schema with array without prop => must thriw TypeError", async () => {
		expect(() => {
			@schema()
			class TestSchema13 {
				@array()
				myNumberArray!: number[];
			}
		}).to.throw(TypeError);
	});

	it("schema with prop (boolean)", async () => {
		@schema()
		class TestSchema14 {
			@prop()
			myBoolean!: boolean;
		}

		expect(use(TestSchema14)).to.be.deep.equals({
			type: "object",
			title: "TestSchema14",
			description: "TestSchema14",
			required: ["myBoolean"],
			properties: {
				myBoolean: {
					type: "boolean",
				},
			},
		});
	});

	it("schema with optional enums", async () => {
		const e = [1, 2, 3];
		type E = typeof e[number];
		@schema()
		class TestSchema15 {
			@enums(e, { required: false })
			myEnum?: E;
		}

		expect(use(TestSchema15)).to.be.deep.equals({
			type: "object",
			title: "TestSchema15",
			description: "TestSchema15",
			required: [],
			properties: {
				myEnum: {
					type: "string",
					enum: e,
				},
			},
		});
	});

	it("schema with default enums", async () => {
		const e = [1, 2, 3] as const;
		type E = typeof e[number];
		@schema()
		class TestSchema15_1 {
			@enums(e, { required: false, default: 2 })
			myEnum?: E;
		}

		expect(use(TestSchema15_1)).to.be.deep.equals({
			type: "object",
			title: "TestSchema15_1",
			description: "TestSchema15_1",
			required: [],
			properties: {
				myEnum: {
					type: "string",
					enum: e,
					default: 2,
				},
			},
		});
	});

	it("schema with inheritance", async () => {
		@schema()
		class TestSchema15Base {
			@prop()
			myNumber!: number;
		}

		@schema()
		class TestSchema15 extends TestSchema15Base {
			@prop()
			myString!: string;
		}

		expect(
			use(TestSchema15Base),
			"base class should have only own items"
		).to.be.deep.equals({
			type: "object",
			title: "TestSchema15Base",
			description: "TestSchema15Base",
			required: ["myNumber"],
			properties: {
				myNumber: {
					type: "number",
				},
			},
		});

		expect(
			use(TestSchema15),
			"extends have base plus extends"
		).to.be.deep.equals({
			type: "object",
			title: "TestSchema15",
			description: "TestSchema15",
			required: ["myNumber", "myString"],
			properties: {
				myNumber: {
					type: "number",
				},
				myString: {
					type: "string",
				},
			},
		});
	});

	it("schema with inheritance with inheritance", async () => {
		@schema()
		class TestSchema16BaseBase {
			@prop()
			myNumber!: number;
		}

		@schema()
		class TestSchema16Base extends TestSchema16BaseBase {
			@prop()
			myString!: string;
		}

		@schema()
		class TestSchema16 extends TestSchema16Base {
			@prop()
			myBoolean!: boolean;
		}

		expect(
			use(TestSchema16BaseBase),
			"base class should have only own items"
		).to.be.deep.equals({
			type: "object",
			title: "TestSchema16BaseBase",
			description: "TestSchema16BaseBase",
			required: ["myNumber"],
			properties: {
				myNumber: {
					type: "number",
				},
			},
		});

		expect(
			use(TestSchema16Base),
			"extends have base plus extends"
		).to.be.deep.equals({
			type: "object",
			title: "TestSchema16Base",
			description: "TestSchema16Base",
			required: ["myNumber", "myString"],
			properties: {
				myNumber: {
					type: "number",
				},
				myString: {
					type: "string",
				},
			},
		});

		expect(
			use(TestSchema16),
			"extends have base plus extends plus extends"
		).to.be.deep.equals({
			type: "object",
			title: "TestSchema16",
			description: "TestSchema16",
			required: ["myNumber", "myString", "myBoolean"],
			properties: {
				myNumber: {
					type: "number",
				},
				myString: {
					type: "string",
				},
				myBoolean: {
					type: "boolean",
				},
			},
		});
	});

	//
	it("schema with prop with properties", async () => {
		@schema()
		class TestSchema17 {
			@prop()
			myNumber!: number;
		}

		expect(use(TestSchema17)).to.deep.contains({
			type: "object",
			title: "TestSchema17",
			description: "TestSchema17",
			required: ["myNumber"],
			properties: {
				myNumber: {
					type: "number",
				},
			},
		});
	});

	//
	it("schema with additional properties", async () => {
		class TestSchema18AdditionalProps {
			@prop()
			myNumber!: number;

			@prop()
			myString!: string;
		}

		@schema()
		class TestSchema18 {
			@additionalProps(TestSchema18AdditionalProps)
			myAdditionalProps!: Record<string, TestSchema18AdditionalProps>;
		}
		expect(use(TestSchema18)).to.deep.contains({
			type: "object",
			title: "TestSchema18",
			description: "TestSchema18",
			required: ["myAdditionalProps"],
			properties: {
				myAdditionalProps: {
					type: "object",
					additionalProperties: {
						type: "object",
						required: ["myNumber", "myString"],
						properties: {
							myNumber: {
								type: "number",
							},
							myString: {
								type: "string",
							},
						},
					},
				},
			},
		});
	});

	it("schema with additional properties value", async () => {
		@schema()
		class TestSchema19 {
			@additionalProps(Number)
			myAdditionalProps!: Record<string, number>;
		}
		expect(use(TestSchema19)).to.deep.contains({
			type: "object",
			title: "TestSchema19",
			description: "TestSchema19",
			required: ["myAdditionalProps"],
			properties: {
				myAdditionalProps: {
					type: "object",
					additionalProperties: {
						type: "number",
					},
				},
			},
		});
	});

	it("schema with value as nullable", async () => {
		@schema()
		class TestSchema20 {
			@prop(String, { required: true, nullable: true })
			value!: string | null;
		}

		// console.log({ TestSchema20: JSON.stringify(use(TestSchema20), null, 4) })

		expect(use(TestSchema20)).to.deep.contains({
			type: "object",
			title: "TestSchema20",
			description: "TestSchema20",
			properties: {
				value: {
					anyOf: [{ type: "string" }, { type: "null" }],
				},
			},
			required: ["value"],
		});
	});

	it("schema with value as nullable optional", async () => {
		@schema()
		class TestSchema21 {
			@prop(String, { nullable: true, required: false })
			value!: string | null;
		}

		// console.log({ TestSchema21: JSON.stringify(use(TestSchema21), null, 4) })

		expect(use(TestSchema21)).to.deep.contains({
			type: "object",
			title: "TestSchema21",
			description: "TestSchema21",
			properties: {
				value: {
					anyOf: [{ type: "string" }, { type: "null" }],
				},
			},
			required: [],
		});
	});

	it("schema with value as ref and nullable", async () => {
		@schema()
		class TestSchema22Ref {
			@prop()
			val!: string;
		}

		@schema()
		class TestSchema22 {
			@ref(TestSchema22Ref, { nullable: true })
			value!: TestSchema22Ref | null;
		}

		// console.log({ TestSchema22: JSON.stringify(use(TestSchema22), null, 4) })

		expect(use(TestSchema22)).to.deep.contains({
			type: "object",
			title: "TestSchema22",
			description: "TestSchema22",
			properties: {
				value: {
					anyOf: [
						{
							type: "object",
							title: "TestSchema22Ref",
							description: "TestSchema22Ref",
							properties: { val: { type: "string" } },
							required: ["val"],
						},
						{ type: "null" },
					],
				},
			},
			required: ["value"],
		});
	});

	it("schema with value as array ref and nullable", async () => {
		@schema()
		class TestSchema23Ref {
			@prop()
			val!: string;
		}

		@schema()
		class TestSchema23 {
			@array({ nullable: true })
			@ref(TestSchema23Ref)
			value!: TestSchema23Ref | null;
		}

		// console.log({ TestSchema23: JSON.stringify(use(TestSchema23), null, 4) })

		expect(use(TestSchema23)).to.deep.contains({
			type: "object",
			title: "TestSchema23",
			description: "TestSchema23",
			properties: {
				value: {
					anyOf: [
						{
							type: "array",
							items: {
								type: "object",
								title: "TestSchema23Ref",
								description: "TestSchema23Ref",
								properties: { val: { type: "string" } },
								required: ["val"],
							},
						},
						{ type: "null" },
					],
				},
			},
			required: ["value"],
		});
	});

	it("schema oneOf", async () => {
		@schema()
		class TestSchema24A {
			@prop()
			a!: string;
		}

		@schema()
		class TestSchema24B {
			@prop()
			b!: string;
		}

		@schema()
		class TestSchema24 {
			@oneOf([TestSchema24A, TestSchema24B])
			ab!: TestSchema24A | TestSchema24B;
		}

		// console.log({ TestSchema24: use(TestSchema24) })

		expect(use(TestSchema24)).to.deep.contains({
			type: "object",
			title: "TestSchema24",
			description: "TestSchema24",
			properties: {
				ab: {
					oneOf: [
						{
							type: "object",
							title: "TestSchema24A",
							description: "TestSchema24A",
							properties: {
								a: { type: "string" },
							},
							required: ["a"],
						},
						{
							type: "object",
							title: "TestSchema24B",
							description: "TestSchema24B",
							properties: {
								b: { type: "string" },
							},
							required: ["b"],
						},
					],
				},
			},
			required: ["ab"],
		});
	});

	it("schema oneOf optional", async () => {
		@schema()
		class TestSchema25A {
			@prop()
			a!: string;
		}

		@schema()
		class TestSchema25B {
			@prop()
			b!: string;
		}

		@schema()
		class TestSchema25 {
			@oneOf([TestSchema25A, TestSchema25B], { required: false })
			ab!: TestSchema25A | TestSchema25B;
		}

		// console.log({ TestSchema25: use(TestSchema25) })

		expect(use(TestSchema25)).to.deep.contains({
			type: "object",
			title: "TestSchema25",
			description: "TestSchema25",
			properties: {
				ab: {
					oneOf: [
						{
							type: "object",
							title: "TestSchema25A",
							description: "TestSchema25A",
							properties: {
								a: { type: "string" },
							},
							required: ["a"],
						},
						{
							type: "object",
							title: "TestSchema25B",
							description: "TestSchema25B",
							properties: {
								b: { type: "string" },
							},
							required: ["b"],
						},
					],
				},
			},
			required: [],
		});
	});

	//

	it("schema anyOf", async () => {
		@schema()
		class TestSchema26A {
			@prop()
			a!: string;
		}

		@schema()
		class TestSchema26B {
			@prop()
			b!: string;
		}

		@schema()
		class TestSchema26 {
			@anyOf([TestSchema26A, TestSchema26B])
			ab!: TestSchema26A | TestSchema26B;
		}

		expect(use(TestSchema26)).to.deep.contains({
			type: "object",
			title: "TestSchema26",
			description: "TestSchema26",
			properties: {
				ab: {
					anyOf: [
						{
							type: "object",
							title: "TestSchema26A",
							description: "TestSchema26A",
							properties: {
								a: { type: "string" },
							},
							required: ["a"],
						},
						{
							type: "object",
							title: "TestSchema26B",
							description: "TestSchema26B",
							properties: {
								b: { type: "string" },
							},
							required: ["b"],
						},
					],
				},
			},
			required: ["ab"],
		});
	});

	it("schema anyOf optional", async () => {
		@schema()
		class TestSchema27A {
			@prop()
			a!: string;
		}

		@schema()
		class TestSchema27B {
			@prop()
			b!: string;
		}

		@schema()
		class TestSchema27 {
			@anyOf([TestSchema27A, TestSchema27B], { required: false })
			ab!: TestSchema27A | TestSchema27B;
		}

		// console.log({ TestSchema25: use(TestSchema25) })

		expect(use(TestSchema27)).to.deep.contains({
			type: "object",
			title: "TestSchema27",
			description: "TestSchema27",
			properties: {
				ab: {
					anyOf: [
						{
							type: "object",
							title: "TestSchema27A",
							description: "TestSchema27A",
							properties: {
								a: { type: "string" },
							},
							required: ["a"],
						},
						{
							type: "object",
							title: "TestSchema27B",
							description: "TestSchema27B",
							properties: {
								b: { type: "string" },
							},
							required: ["b"],
						},
					],
				},
			},
			required: [],
		});
	});

	it("schema allOf", async () => {
		@schema()
		class TestSchema28A {
			@prop()
			a!: string;
		}

		@schema()
		class TestSchema28B {
			@prop()
			b!: string;
		}

		@schema()
		class TestSchema28 {
			@allOf([TestSchema28A, TestSchema28B])
			ab!: TestSchema28A | TestSchema28B;
		}

		// console.log({ TestSchema24: use(TestSchema24) })

		expect(use(TestSchema28)).to.deep.contains({
			type: "object",
			title: "TestSchema28",
			description: "TestSchema28",
			properties: {
				ab: {
					allOf: [
						{
							type: "object",
							title: "TestSchema28A",
							description: "TestSchema28A",
							properties: {
								a: { type: "string" },
							},
							required: ["a"],
						},
						{
							type: "object",
							title: "TestSchema28B",
							description: "TestSchema28B",
							properties: {
								b: { type: "string" },
							},
							required: ["b"],
						},
					],
				},
			},
			required: ["ab"],
		});
	});

	it("schema allOf optional", async () => {
		@schema()
		class TestSchema29A {
			@prop()
			a!: string;
		}

		@schema()
		class TestSchema29B {
			@prop()
			b!: string;
		}

		@schema()
		class TestSchema29 {
			@allOf([TestSchema29A, TestSchema29B], { required: false })
			ab!: TestSchema29A | TestSchema29B;
		}

		// console.log({ TestSchema25: use(TestSchema25) })

		expect(use(TestSchema29)).to.deep.contains({
			type: "object",
			title: "TestSchema29",
			description: "TestSchema29",
			properties: {
				ab: {
					allOf: [
						{
							type: "object",
							title: "TestSchema29A",
							description: "TestSchema29A",
							properties: {
								a: { type: "string" },
							},
							required: ["a"],
						},
						{
							type: "object",
							title: "TestSchema29B",
							description: "TestSchema29B",
							properties: {
								b: { type: "string" },
							},
							required: ["b"],
						},
					],
				},
			},
			required: [],
		});
	});

	it("array not required", async () => {
		@schema()
		class TestSchema30 {
			@array()
			@prop(String, { required: false })
			myArray?: string[];
		}

		expect(use(TestSchema30)).to.deep.contains({
			type: "object",
			title: "TestSchema30",
			description: "TestSchema30",
			properties: {
				myArray: {
					type: "array",
					items: {
						type: "string",
					},
				},
			},
			required: [],
		});
	});

	it("array min max items", async () => {
		@schema()
		class TestSchema31 {
			@array({ min: 1, max: 10 })
			@prop(String, { required: false })
			myArray?: string[];
		}

		expect(use(TestSchema31)).to.deep.contains({
			type: "object",
			title: "TestSchema31",
			description: "TestSchema31",
			properties: {
				myArray: {
					type: "array",
					items: {
						type: "string",
					},
					minItems: 1,
					maxItems: 10,
				},
			},
			required: [],
		});
	});

	it("array unique items", async () => {
		@schema()
		class TestSchema32 {
			@array({ unique: true })
			@prop(String, { required: false })
			myArray?: string[];
		}

		expect(use(TestSchema32)).to.deep.contains({
			type: "object",
			title: "TestSchema32",
			description: "TestSchema32",
			properties: {
				myArray: {
					type: "array",
					items: {
						type: "string",
					},
					uniqueItems: true,
				},
			},
			required: [],
		});
	});

	it("const required", async () => {
		@schema()
		class TestSchema33 {
			@consts("hello")
			myConst!: "hello";
		}

		expect(use(TestSchema33)).to.deep.contains({
			type: "object",
			title: "TestSchema33",
			description: "TestSchema33",
			properties: {
				myConst: {
					type: "string",
					const: "hello",
				},
			},
			required: ["myConst"],
		});
	});

	it("const optional", async () => {
		@schema()
		class TestSchema34 {
			@consts("hello", { required: false })
			myConst!: "hello";
		}

		expect(use(TestSchema34)).to.deep.contains({
			type: "object",
			title: "TestSchema34",
			description: "TestSchema34",
			properties: {
				myConst: {
					type: "string",
					const: "hello",
				},
			},
			required: [],
		});
	});

	it("use base types", async () => {
		expect(use(String)).to.deep.contains({
			type: "string",
		});

		expect(use(Number)).to.deep.contains({
			type: "number",
		});

		expect(use(Boolean)).to.deep.contains({
			type: "boolean",
		});

		expect(use(null)).to.deep.contains({
			type: "null",
		});

		expect(useArray(String)).to.deep.contains({
			type: "array",
			items: {
				type: "string",
			},
		});

		expect(useArray(Number)).to.deep.contains({
			type: "array",
			items: {
				type: "number",
			},
		});

		expect(useArray(Boolean)).to.deep.contains({
			type: "array",
			items: {
				type: "boolean",
			},
		});

		expect(useArray(null)).to.deep.contains({
			type: "array",
			items: {
				type: "null",
			},
		});
	});

	it("use enum", async () => {
		expect(useEnum(["a", "b", 1])).to.deep.contains({
			enum: ["a", "b", 1],
		});
	});

	it('use the user-defined schema description', () => {
		@schema({
			description: 'My description'
		})
		class TestSchema35 {}

		expect(use(TestSchema35)).to.deep.contains({
			type: "object",
			title: "TestSchema35",
			description: "My description",
		});
	});

	it('use the class name by default as schema description', () => {
		@schema()
		class TestSchema36 {}

		expect(use(TestSchema36)).to.deep.contains({
			type: "object",
			title: "TestSchema36",
			description: "TestSchema36",
		});
	});

	it('use the user-defined schema description with inherited schema', () => {
		@schema({
			description: 'Parent schema description'
		})
		class TestSchema37A {
			@prop()
			myProp: string;
		}

		@schema({
			description: 'Child schema description'
		})
		class TestSchema37B extends TestSchema37A {
			@prop()
			anotherProp: string;
		}

		expect(use(TestSchema37B)).to.deep.contains({
			type: "object",
			title: "TestSchema37B",
			description: "Child schema description",
		});
	});

	it('use the class name by default as schema description with inherited schema', () => {
		@schema({
			description: 'Parent schema description'
		})
		class TestSchema38A {
			@prop()
			myProp: string;
		}

		@schema()
		class TestSchema38B extends TestSchema38A {
			@prop()
			anotherProp: string;
		}

		expect(use(TestSchema38B)).to.deep.contains({
			type: "object",
			title: "TestSchema38B",
			description: "TestSchema38B",
		});
	});
});
