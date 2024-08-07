---
icon: IbDocument
---
#Blog #TypeScript #Prisma #ORM #Challenges #Jison #Parsers
#### Introduction

In this article, I will explore how to convert [SQL](https://blog.ansi.org/sql-standard-iso-iec-9075-2023-ansi-x3-135/) WHERE clauses into Prisma queries using [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) and [Jison](https://gerhobbelt.github.io/jison/docs/). [Prisma](https://www.prisma.io/docs) is a powerful [ORM](https://www.freecodecamp.org/news/what-is-an-orm-the-meaning-of-object-relational-mapping-database-tools/) tool for [Node.js](https://nodejs.org/docs/latest/api/) and TypeScript, and converting [SQL WHERE](https://www.ibm.com/docs/en/iotdmfz/11.3?topic=criteria-sql-where-clause-specifications) clauses to its format can be very useful. We will use Jison to create a parser that performs this conversion efficiently.

#### The Challenge

The challenge is to convert an SQL WHERE query string into a Prisma-compatible object. The queries can have an infinite level of nesting and must handle common operators like `=`, `!=`, `<>`, `LIKE`, `AND`, `OR`, `NOT`, `>`, `<`, `>=`, and `<=`.

#### The Solution

We will use Jison to create a parser that converts these SQL WHERE clauses into Prisma format.
#### Step 1: Install some dependencies

First, install Jison globally on your system:

```bash
npm install -g jison
```

Second, a recommendation:

```bash
npm install --save-dev @types/node
```

#### Step 2: Create the Jison Grammar

Create a file named `where_condition.jison` with the following content:

```jison
%lex

%options case-insensitive

%%

\s+                            /* skip whitespace */
"("                            return '('
")"                            return ')'
"="                            return '='
"!="                           return '!='
"<>"                           return '!='
">="                           return '>='
"<="                           return '<='
">"                            return '>'
"<"                            return '<'
"AND"                          return 'AND'
"OR"                           return 'OR'
"NOT"                          return 'NOT'
"LIKE"                         return 'LIKE'
[-]?([0-9]+([.][0-9]*)?|[.][0-9]+) return 'NUMBER'
\"([^\\\"]|\\.)*\"             return 'IDENTIFIER'
\'([^\\\']|\\.)*\'             return 'STRING'
[0-9]+                         return 'NUMBER'
[a-zA-Z_][a-zA-Z0-9_]*         return 'IDENTIFIER'
<<EOF>>                        return 'EOF'
.                              return 'INVALID'

/lex

%start conditions

%%

conditions
  : expression EOF { return $1; }
  ;

expression
  : term
  | expression AND term { $$ = { type: 'AndExpression', left: $1, right: $3 }; }
  | expression OR term { $$ = { type: 'OrExpression', left: $1, right: $3 }; }
  ;

term
  : factor
  | NOT factor { $$ = { type: 'NotExpression', value: $2 }; }
  ;

factor
  : primary
  | '(' expression ')' { $$ = $2; }
  ;

primary
  : IDENTIFIER operator value { $$ = { type: 'Condition', left: $1, operator: $2, right: $3 }; }
  ;

operator
  : '=' { $$ = $1; }
  | '!=' { $$ = $1; }
  | '>=' { $$ = $1; }
  | '<=' { $$ = $1; }
  | '>' { $$ = $1; }
  | '<' { $$ = $1; }
  | LIKE { $$ = $1; }
  ;

value
  : STRING { $$ = $1; }
  | NUMBER { $$ = $1; }
  ;

```

#### Step 3: Generate the Parser

Generate the parser using Jison:

```bash
jison where_condition.jison
```

This will generate a `where_condition.js` file that contains the parser.

#### Step 4: Use the Parser in TypeScript

Create a TypeScript file `prisma.ts` to use the generated parser:

```typescript
const parser = require('./where_condition');

interface PrismaWhereInput {
  AND?: PrismaWhereInput | PrismaWhereInput[];
  OR?: PrismaWhereInput | PrismaWhereInput[];
  NOT?: PrismaWhereInput | PrismaWhereInput[];
  [key: string]: any;
}

const convertSQLToPrisma = (query: string): PrismaWhereInput => {
  const ast = parser.parse(query);
  console.log(`AST: ${JSON.stringify(ast, null, 2)}\n`);

  const parseCondition = (condition: any): PrismaWhereInput => {
    const { left, operator, right } = condition;
    const prismaOperator = operator === '<>' ? '!=' : operator;
    return { [left.replace(/["]/g, '')]: { [prismaOperator]: right.replace(/['"]/g, '') } };
  };

  const convertAstToPrisma = (node: any): PrismaWhereInput => {
    if (node.type === 'AndExpression') {
      return { AND: [convertAstToPrisma(node.left), convertAstToPrisma(node.right)] };
    }
    if (node.type === 'OrExpression') {
      return { OR: [convertAstToPrisma(node.left), convertAstToPrisma(node.right)] };
    }
    if (node.type === 'NotExpression') {
      return { NOT: [convertAstToPrisma(node.value)] };
    }
    return parseCondition(node);
  };

  return convertAstToPrisma(ast);
};

// test some queries
const testQueries = [
  `("name" like '%Car%' AND "date" > '2024-08-03')`,
  `("name" = 'Car' OR "date" < '2024-08-03' AND "categoryId" = '9')`,
  `("name" = 'Car' AND ("date" > '2024-08-03' OR "categoryId" = '9'))`,
  `("name" = 'Car' AND ("date" > '2024-08-03' AND "categoryId" = '9'))`,
  `("name" <> 'Car' OR ("date" < '2024-08-03' AND "categoryId" != '9'))`,
  `("name" = 'Car' AND "date" > '2024-08-03' AND "amount" < '123' AND "merchantId" = '44')`,
  `(("name" = 'Car' AND "date" > '2024-08-03') OR ("categoryId" = '9' AND "amount" > '123'))`,
  `(("name" like '%Car%' OR "categoryId" = '9') AND ("amount" >= '123' AND "merchantId" <> '44'))`,
  `("name" = 'Car' AND ("date" > '2024-08-03' OR ("categoryId" = '9' AND "amount" > '123')))`,
  `("name" like '%Car%' OR "date" > '2024-08-03' OR "categoryId" = '9' OR ("amount" > '123' AND "categoryId" != '19'))`,
  `(("name" = 'Car' AND ("date" > '2024-08-03' OR "categoryId" = '9')) OR ("amount" > '123' AND "categoryId" != '19'))`
];

testQueries.forEach((query, index) => {
  console.log(`\nTest Query ${index + 1}: ${query}\n`);
  const prismaQuery = convertSQLToPrisma(query);
  console.log(JSON.stringify(prismaQuery, null, 2));
});

```

#### Step 5: Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2016",
    "module": "commonjs",
    "lib": ["ES2016", "DOM"],
    "esModuleInterop": true
  }
}
```
#### Step 6: Compile and Run
   
```bash
tsc prisma.ts
node prisma.js
```

### Verify the Output

The output of the program should correctly reflect the parsed and combined conditions for all provided query variants, including those using the `<>` operator and nested parentheses.

```json

Test Query 1: ("name" like '%Car%' AND "date" > '2024-08-03')

AST: {
  "type": "AndExpression",
  "left": {
    "type": "Condition",
    "left": "\"name\"",
    "operator": "like",
    "right": "'%Car%'"
  },
  "right": {
    "type": "Condition",
    "left": "\"date\"",
    "operator": ">",
    "right": "'2024-08-03'"
  }
}

{
  "AND": [
    {
      "name": {
        "like": "%Car%"
      }
    },
    {
      "date": {
        ">": "2024-08-03"
      }
    }
  ]
}

Test Query 2: ("name" = 'Car' OR "date" < '2024-08-03' AND "categoryId" = '9')

AST: {
  "type": "AndExpression",
  "left": {
    "type": "OrExpression",
    "left": {
      "type": "Condition",
      "left": "\"name\"",
      "operator": "=",
      "right": "'Car'"
    },
    "right": {
      "type": "Condition",
      "left": "\"date\"",
      "operator": "<",
      "right": "'2024-08-03'"
    }
  },
  "right": {
    "type": "Condition",
    "left": "\"categoryId\"",
    "operator": "=",
    "right": "'9'"
  }
}

{
  "AND": [
    {
      "OR": [
        {
          "name": {
            "=": "Car"
          }
        },
        {
          "date": {
            "<": "2024-08-03"
          }
        }
      ]
    },
    {
      "categoryId": {
        "=": "9"
      }
    }
  ]
}

Test Query 3: ("name" = 'Car' AND ("date" > '2024-08-03' OR "categoryId" = '9'))

AST: {
  "type": "AndExpression",
  "left": {
    "type": "Condition",
    "left": "\"name\"",
    "operator": "=",
    "right": "'Car'"
  },
  "right": {
    "type": "OrExpression",
    "left": {
      "type": "Condition",
      "left": "\"date\"",
      "operator": ">",
      "right": "'2024-08-03'"
    },
    "right": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "=",
      "right": "'9'"
    }
  }
}

{
  "AND": [
    {
      "name": {
        "=": "Car"
      }
    },
    {
      "OR": [
        {
          "date": {
            ">": "2024-08-03"
          }
        },
        {
          "categoryId": {
            "=": "9"
          }
        }
      ]
    }
  ]
}

Test Query 4: ("name" = 'Car' AND ("date" > '2024-08-03' AND "categoryId" = '9'))

AST: {
  "type": "AndExpression",
  "left": {
    "type": "Condition",
    "left": "\"name\"",
    "operator": "=",
    "right": "'Car'"
  },
  "right": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"date\"",
      "operator": ">",
      "right": "'2024-08-03'"
    },
    "right": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "=",
      "right": "'9'"
    }
  }
}

{
  "AND": [
    {
      "name": {
        "=": "Car"
      }
    },
    {
      "AND": [
        {
          "date": {
            ">": "2024-08-03"
          }
        },
        {
          "categoryId": {
            "=": "9"
          }
        }
      ]
    }
  ]
}

Test Query 5: ("name" <> 'Car' OR ("date" < '2024-08-03' AND "categoryId" != '9'))

AST: {
  "type": "OrExpression",
  "left": {
    "type": "Condition",
    "left": "\"name\"",
    "operator": "<>",
    "right": "'Car'"
  },
  "right": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"date\"",
      "operator": "<",
      "right": "'2024-08-03'"
    },
    "right": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "!=",
      "right": "'9'"
    }
  }
}

{
  "OR": [
    {
      "name": {
        "!=": "Car"
      }
    },
    {
      "AND": [
        {
          "date": {
            "<": "2024-08-03"
          }
        },
        {
          "categoryId": {
            "!=": "9"
          }
        }
      ]
    }
  ]
}

Test Query 6: ("name" = 'Car' AND "date" > '2024-08-03' AND "amount" < '123' AND "merchantId" = '44')

AST: {
  "type": "AndExpression",
  "left": {
    "type": "AndExpression",
    "left": {
      "type": "AndExpression",
      "left": {
        "type": "Condition",
        "left": "\"name\"",
        "operator": "=",
        "right": "'Car'"
      },
      "right": {
        "type": "Condition",
        "left": "\"date\"",
        "operator": ">",
        "right": "'2024-08-03'"
      }
    },
    "right": {
      "type": "Condition",
      "left": "\"amount\"",
      "operator": "<",
      "right": "'123'"
    }
  },
  "right": {
    "type": "Condition",
    "left": "\"merchantId\"",
    "operator": "=",
    "right": "'44'"
  }
}

{
  "AND": [
    {
      "AND": [
        {
          "AND": [
            {
              "name": {
                "=": "Car"
              }
            },
            {
              "date": {
                ">": "2024-08-03"
              }
            }
          ]
        },
        {
          "amount": {
            "<": "123"
          }
        }
      ]
    },
    {
      "merchantId": {
        "=": "44"
      }
    }
  ]
}

Test Query 7: (("name" = 'Car' AND "date" > '2024-08-03') OR ("categoryId" = '9' AND "amount" > '123'))

AST: {
  "type": "OrExpression",
  "left": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"name\"",
      "operator": "=",
      "right": "'Car'"
    },
    "right": {
      "type": "Condition",
      "left": "\"date\"",
      "operator": ">",
      "right": "'2024-08-03'"
    }
  },
  "right": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "=",
      "right": "'9'"
    },
    "right": {
      "type": "Condition",
      "left": "\"amount\"",
      "operator": ">",
      "right": "'123'"
    }
  }
}

{
  "OR": [
    {
      "AND": [
        {
          "name": {
            "=": "Car"
          }
        },
        {
          "date": {
            ">": "2024-08-03"
          }
        }
      ]
    },
    {
      "AND": [
        {
          "categoryId": {
            "=": "9"
          }
        },
        {
          "amount": {
            ">": "123"
          }
        }
      ]
    }
  ]
}

Test Query 8: (("name" like '%Car%' OR "categoryId" = '9') AND ("amount" >= '123' AND "merchantId" <> '44'))

AST: {
  "type": "AndExpression",
  "left": {
    "type": "OrExpression",
    "left": {
      "type": "Condition",
      "left": "\"name\"",
      "operator": "like",
      "right": "'%Car%'"
    },
    "right": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "=",
      "right": "'9'"
    }
  },
  "right": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"amount\"",
      "operator": ">=",
      "right": "'123'"
    },
    "right": {
      "type": "Condition",
      "left": "\"merchantId\"",
      "operator": "<>",
      "right": "'44'"
    }
  }
}

{
  "AND": [
    {
      "OR": [
        {
          "name": {
            "like": "%Car%"
          }
        },
        {
          "categoryId": {
            "=": "9"
          }
        }
      ]
    },
    {
      "AND": [
        {
          "amount": {
            ">=": "123"
          }
        },
        {
          "merchantId": {
            "!=": "44"
          }
        }
      ]
    }
  ]
}

Test Query 9: ("name" = 'Car' AND ("date" > '2024-08-03' OR ("categoryId" = '9' AND "amount" > '123')))

AST: {
  "type": "AndExpression",
  "left": {
    "type": "Condition",
    "left": "\"name\"",
    "operator": "=",
    "right": "'Car'"
  },
  "right": {
    "type": "OrExpression",
    "left": {
      "type": "Condition",
      "left": "\"date\"",
      "operator": ">",
      "right": "'2024-08-03'"
    },
    "right": {
      "type": "AndExpression",
      "left": {
        "type": "Condition",
        "left": "\"categoryId\"",
        "operator": "=",
        "right": "'9'"
      },
      "right": {
        "type": "Condition",
        "left": "\"amount\"",
        "operator": ">",
        "right": "'123'"
      }
    }
  }
}

{
  "AND": [
    {
      "name": {
        "=": "Car"
      }
    },
    {
      "OR": [
        {
          "date": {
            ">": "2024-08-03"
          }
        },
        {
          "AND": [
            {
              "categoryId": {
                "=": "9"
              }
            },
            {
              "amount": {
                ">": "123"
              }
            }
          ]
        }
      ]
    }
  ]
}

Test Query 10: ("name" like '%Car%' OR "date" > '2024-08-03' OR "categoryId" = '9' OR ("amount" > '123' AND "categoryId" != '19'))

AST: {
  "type": "OrExpression",
  "left": {
    "type": "OrExpression",
    "left": {
      "type": "OrExpression",
      "left": {
        "type": "Condition",
        "left": "\"name\"",
        "operator": "like",
        "right": "'%Car%'"
      },
      "right": {
        "type": "Condition",
        "left": "\"date\"",
        "operator": ">",
        "right": "'2024-08-03'"
      }
    },
    "right": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "=",
      "right": "'9'"
    }
  },
  "right": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"amount\"",
      "operator": ">",
      "right": "'123'"
    },
    "right": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "!=",
      "right": "'19'"
    }
  }
}

{
  "OR": [
    {
      "OR": [
        {
          "OR": [
            {
              "name": {
                "like": "%Car%"
              }
            },
            {
              "date": {
                ">": "2024-08-03"
              }
            }
          ]
        },
        {
          "categoryId": {
            "=": "9"
          }
        }
      ]
    },
    {
      "AND": [
        {
          "amount": {
            ">": "123"
          }
        },
        {
          "categoryId": {
            "!=": "19"
          }
        }
      ]
    }
  ]
}

Test Query 11: (("name" = 'Car' AND ("date" > '2024-08-03' OR "categoryId" = '9')) OR ("amount" > '123' AND "categoryId" != '19'))

AST: {
  "type": "OrExpression",
  "left": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"name\"",
      "operator": "=",
      "right": "'Car'"
    },
    "right": {
      "type": "OrExpression",
      "left": {
        "type": "Condition",
        "left": "\"date\"",
        "operator": ">",
        "right": "'2024-08-03'"
      },
      "right": {
        "type": "Condition",
        "left": "\"categoryId\"",
        "operator": "=",
        "right": "'9'"
      }
    }
  },
  "right": {
    "type": "AndExpression",
    "left": {
      "type": "Condition",
      "left": "\"amount\"",
      "operator": ">",
      "right": "'123'"
    },
    "right": {
      "type": "Condition",
      "left": "\"categoryId\"",
      "operator": "!=",
      "right": "'19'"
    }
  }
}

{
  "OR": [
    {
      "AND": [
        {
          "name": {
            "=": "Car"
          }
        },
        {
          "OR": [
            {
              "date": {
                ">": "2024-08-03"
              }
            },
            {
              "categoryId": {
                "=": "9"
              }
            }
          ]
        }
      ]
    },
    {
      "AND": [
        {
          "amount": {
            ">": "123"
          }
        },
        {
          "categoryId": {
            "!=": "19"
          }
        }
      ]
    }
  ]
}
```
### Conclusion

By using Jison to create a custom parser, we can efficiently convert SQL WHERE clauses into Prisma queries. This approach ensures that complex SQL expressions are accurately translated, making it easier to work with Prisma in a TypeScript environment.
### References and Related Resources

- [i] https://www.prisma.io/docs/getting-started/quickstart
- [i] https://gerhobbelt.github.io/jison/docs/
- [i] https://www.typescriptlang.org/docs/
- [i] https://nodejs.org/docs/latest/api/
- [i] https://blog.ansi.org/sql-standard-iso-iec-9075-2023-ansi-x3-135/

