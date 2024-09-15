---
title: Universal and Flexible Error Handling in ECMAScript
icon: IbDocumentText
---
#Contribution #JavaScript #Proposal #TC39

![[Pasted image 20240914184950.png]]
![[Captura de pantalla 2024-09-15 112016.png]]
# Universal and Flexible Error Handling in ECMAScript

## Table of Contents

- [Universal and Flexible Error Handling in ECMAScript](#universal-and-flexible-error-handling-in-ecmascript)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
    - [Key Concepts](#key-concepts)
    - [Engagement](#engagement)
    - [Benefits](#benefits)
  - [The proposal](#the-proposal)
    - [Proposed Syntax](#proposed-syntax)
    - [Grammar](#grammar)
    - [Static Semantics: Early Errors](#static-semantics-early-errors)
    - [Runtime Semantics: CatchClauseEvaluation](#runtime-semantics-catchclauseevaluation)
    - [Runtime Semantics: Block Evaluation](#runtime-semantics-block-evaluation)
    - [Comparison with Existing Syntax](#comparison-with-existing-syntax)
      - [Current](#current)
      - [Proposed](#proposed)
  - [Examples](#examples)
    - [`try-catch` (the current specification)](#try-catch-the-current-specification)
    - [`try-catch` with `when` clause](#try-catch-with-when-clause)
    - [`anonymous-catch` (no `try` block)](#anonymous-catch-no-try-block)
    - [`if-catch`](#if-catch)
    - [`if-catch` with `when` Clause](#if-catch-with-when-clause)
    - [`for-catch`](#for-catch)
    - [`while-catch`](#while-catch)
    - [`function-catch`](#function-catch)
    - [`catch-catch`](#catch-catch)
    - [`do-catch`](#do-catch)
    - [`finally-catch`](#finally-catch)
    - [`try-catch-throw-catch`](#try-catch-throw-catch)
    - [`try-cath` with `if-catch-when` inside](#try-cath-with-if-catch-when-inside)
    - [`case-body-catch`](#case-body-catch)
  - [List of combinations](#list-of-combinations)
  - [Analysis](#analysis)
    - [Alignment with Current Exception Handling](#alignment-with-current-exception-handling)
    - [Importance of braces `{}`](#importance-of-braces-)
    - [Importance of semi-colons](#importance-of-semi-colons)
    - [Control flow integrity](#control-flow-integrity)
    - [Avoiding redundant constructs](#avoiding-redundant-constructs)
    - [A structural solution to a structural problem](#a-structural-solution-to-a-structural-problem)
  - [Motivation and inspiration](#motivation-and-inspiration)
  - [References](#references)
  - [Author](#author)
  - [License](#license)

## Introduction

JavaScript's `try-catch` structure is a fundamental tool for error handling, but it can be enhanced for greater flexibility and clarity. This proposal introduces the concept of allowing any block of statements, not just `try` blocks, to have associated `catch` blocks. Furthermore, each `catch block` can have a `when` clause to conditionally handle specific errors, providing a more controlled and expressive approach to managing exceptions.

>[!IMPORTANT]
>This proposal retains the integrity of JavaScript's control flow while offering developers a more intuitive and streamlined way to handle errors, without introducing unnecessary complexity.

```javascript
{ /* ...*/ } catch (e) when (true || false) { /* ... */}
```

This proposal expands JavaScript’s error handling capabilities by allowing any block of statements to have its own `catch` block, with the option to conditionally execute those blocks using the `when` keyword. This enhancement provides developers with more control, clarity, and flexibility while maintaining compatibility with existing JavaScript syntax.

### Key Concepts

1. **Universal `catch` blocks**: Any block of statements, including functions, loops, and even other `catch` blocks, can have its own `catch` statement.
2. **Nested `catch` blocks**: Since a `catch` block is just _another block of code_, it can also have its own `catch` to handle errors within error-handling logic.
3. **Conditional `catch` with `when`**: The `when` clause allows for conditional execution of `catch` blocks, improving the readability and control of error handling.
4. **Conditional catch body**: If the body of the `catch` block is missing, the error variable is still available in the same scope as the `catch` block, allowing for more precise error handling.

### Engagement

JavaScript developers often encounter situations where they need to handle errors in specific ways based on the type of error or other conditions. The current `try-catch` structure can be limiting in these scenarios, leading to complex nested conditions or multiple `try-catch` blocks. By allowing `catch` blocks to be attached to any block of statements, developers can handle errors more precisely and maintain a cleaner code structure.

Language as Go and Rust, allow to catch errors inline, but `catch` is for control flow, and is important keep this principle. To maintain the control flow, the `catch` block in this proposal is optional, and the error variable is available in the same scope as the catch block. With this proposal the following code is possible:

```js
{ var a = 1 } catch (e);

console.log(a);
if (e) console.log(e);
```

In the previous example you are seeing the combination of an `anonymous block` with a `catch without a body`. If you want to do the same in actual JavaScript, you will need an additional block and variable:

```js
try { var a = 1 } catch (e) { var err = e; }

console.log(a);
if (e) console.log(err);
```

### Benefits

- **Precision**: Handle specific error types or conditions directly.
- **Clarity**: The `when` clause makes the error-handling logic clear and concise.
- **Simplicity**: Reduces the need for complex nested conditions within `catch` blocks.
- **Expressiveness**: Offers a more powerful way to handle different error scenarios.

## The proposal

### Proposed Syntax

The proposed syntax allows for `catch` blocks to be attached to any code block and for those blocks to conditionally execute based on the `when` clause:

```javascript
/* 
any block of statements: try, anonymous, functions, 
if, do, catch, finally, ... 
*/ 

{
    // Code that may throw an error
    // ...
} 
catch (e) when (false || true) 
{
    // Error-handling logic
    // ...
    // catch is also a block!
}
catch (e) when (false || true) 
{
    // Error-handling logic
    // ...
}
finally 
{
    // Cleanup code, executed regardless of success or failure

    // ... but finally is also a block!
} 
catch (e) when (false || true) 
{
    // Error-handling logic
    // ...
}
catch (e);

{/* ... */ } catch when (false || true);

{ /* ... */} catch;
...
```

### Grammar

The proposed changes to the ECMAScript grammar are as follows:

```grammar
14.2 Block 

Syntax 

    Block[Yield, Await, Return] :
        { StatementList[?Yield, ?Await, ?Return] opt } Catch[?Yield, ?Await, ?Return]? Finally[?Yield, ?Await, ?Return]?

    Catch[Yield, Await, Return] :
        catch ( CatchParameter[?Yield, ?Await] ) when ( Expression ) Block[?Yield, ?Await, ?Return]
        catch ( CatchParameter[?Yield, ?Await] ) Block[?Yield, ?Await, ?Return]
        catch when ( Expression ) Block[?Yield, ?Await, ?Return]
        catch Block[?Yield, ?Await, ?Return]
        catch ( CatchParameter[?Yield, ?Await] )
        catch

    Finally[Yield, Await, Return] :
        finally Block[?Yield, ?Await, ?Return]

14.15 The try Statement

Syntax

TryStatement[Yield, Await, Return] :
    Block[?Yield, ?Await, ?Return]
    
```

### Static Semantics: Early Errors

```plaintext
Block: { StatementList } Catch[?Yield, ?Await, ?Return]? Finally[?Yield, ?Await, ?Return]?
```

- It is a Syntax Error if `BoundNames` of `CatchParameter` contains any duplicate elements.
- It is a Syntax Error if any element of the `BoundNames` of `CatchParameter` also occurs in the `LexicallyDeclaredNames` of `Block`.
- It is a Syntax Error if any element of the `BoundNames` of `CatchParameter` also occurs in the `VarDeclaredNames` of `Block`.
- It is a Syntax Error if the `Expression` in the `when` clause is not a valid Boolean expression.

### Runtime Semantics: CatchClauseEvaluation

```plaintext
Catch: catch ( CatchParameter ) when ( Expression ) Block
```

1. Let `oldEnv` be the running execution context's `LexicalEnvironment`.
2. Let `catchEnv` be `NewDeclarativeEnvironment(oldEnv)`.
3. For each element `argName` of the `BoundNames` of `CatchParameter`, do:
   - a. Perform `! catchEnv.CreateMutableBinding(argName, false)`.
4. Set the running execution context's `LexicalEnvironment` to `catchEnv`.
5. Let `status` be `Completion(BindingInitialization)` of `CatchParameter` with arguments `thrownValue` and `catchEnv`.
6. If `status` is an abrupt completion, then:
   - a. Set the running execution context's `LexicalEnvironment` to `oldEnv`.
   - b. Return `? status`.
7. If the result of evaluating `Expression` is false:
   - a. If there is a subsequent catch block within the same scope, continue with its evaluation.
   - b. If no subsequent catch block exists, propagate the exception.
8. Let `B` be `Completion(Evaluation)` of `Block`.
9. Set the running execution context's `LexicalEnvironment` to `oldEnv`.
10. Return `? B`.

```plaintext
Catch: catch ( CatchParameter )
```

1. Let `oldEnv` be the running execution context's `LexicalEnvironment`.
2. Let `catchEnv` be `NewDeclarativeEnvironment(oldEnv)`.
3. For each element `argName` of the `BoundNames` of `CatchParameter`, do:
   - a. Perform `! catchEnv.CreateMutableBinding(argName, false)`.
4. Set the running execution context's `LexicalEnvironment` to `catchEnv`.
5. Let `status` be `Completion(BindingInitialization)` of `CatchParameter` with arguments `thrownValue` and `catchEnv`.
6. If `status` is an abrupt completion, then:
   - a. Set the running execution context's `LexicalEnvironment` to `oldEnv`.
   - b. Return `? status`.
7. Set the running execution context's `LexicalEnvironment` to `oldEnv`.
8. Continue with the next statement without executing a block.

```plaintext
Catch: catch when ( Expression ) Block
```

1. Let `oldEnv` be the running execution context's `LexicalEnvironment`.
2. Skip the environment creation since there is no `CatchParameter`.
3. Evaluate the `Expression`:
   - a. If the result of evaluating `Expression` is false:
      - i. If there is a subsequent catch block within the same scope, continue with its evaluation.
      - ii. If no subsequent catch block exists in the current scope, propagate the exception to the next catch block in the higher scope.
4. If `Expression` is true, proceed to the next statement.
5. Skip block evaluation since there is no block.
6. Continue execution.

```plaintext
Catch: catch 
```

1. Let `oldEnv` be the running execution context's `LexicalEnvironment`.
2. Skip the environment creation since there is no `CatchParameter`.
3. Simply continue execution without binding any error or evaluating a block.
4. Proceed to the next statement.

### Runtime Semantics: Block Evaluation

```plaintext
Block : { StatementList } Catch[?Yield, ?Await, ?Return]? Finally[?Yield, ?Await, ?Return]?
```

1. Let `B` be `Completion(Evaluation)` of `StatementList`.
2. If `B` is a `throw` completion, then:
   - a. If a `Catch` is present, evaluate `CatchClauseEvaluation` with `B.[[Value]]`.
   - b. If `CatchClauseEvaluation` returns `undefined`, proceed to step 3.  
   - c. Otherwise, let `C` be the result of `CatchClauseEvaluation`.
3. If no `Catch` is present or all `Catch` evaluations result in `undefined`, rethrow the exception.
4. If a `Finally` is present, evaluate it and:
   - a. If the `Finally` evaluation results in an abrupt completion, return that result.
   - b. Otherwise, proceed with the value from the previous step.
5. Return `? C` or `B`, as appropriate.

### Comparison with Existing Syntax

#### Current

The current `try-catch` syntax is limited to the `try` block, which can be followed by one or more `catch` blocks and an optional `finally` block. This structure is restrictive and does not allow for `catch` blocks to be attached to other blocks of code.

```js
try 
{
    // Code that may throw an error
    throw new Error("Error in block");
} 
catch (error) 
{
    if (error.message.includes("block")) {
        console.log("Caught an error in block:", error.message);
    } else {
        throw error;
    }
}
```

#### Proposed

The proposed syntax allows for `catch` blocks to be attached to any block of statements, not just `try` blocks. This flexibility enables developers to handle errors more precisely and conditionally, improving the readability and control of error handling.

```js
/* any block of statements */ 
{
    // Code that may throw an error
    throw new Error("Error in block");
} 
catch (error) /* optional */ when (error.message.includes("block")) 
{
    console.log("Caught an error in block:", error.message);
}
```

## Examples

### `try-catch` (the current specification)

This proposal is compatible with the existing `try-catch` syntax.

```js
try 
{
    // Code that may throw an error
    throw new Error("Error in block");
} 
catch (error) 
{
    console.log("Caught an error in block:", error.message);
}
```

### `try-catch` with `when` clause

Users can conditionally handle errors based on the `when` clause.

```js
try {
    data = fetchData();
} 
catch (err) when (err instanceof NetworkError) {
    console.error('Network error:', err.message);
} 
catch (err) when (err instanceof SyntaxError) {
    console.error('Syntax error in response:', err.message);
} 
finally {
    console.log('Cleanup code, executed regardless of success or failure.');
}
```

### `anonymous-catch` (no `try` block)

No `try` block is required to have a `catch` block.

```js
{
    // Code that may throw an error
    throw new Error("Error in block");
} 
catch (error) when (error.message.includes("block")) 
{
    console.log("Caught an error in block:", error.message);
}
```

### `if-catch`

No `try` block is required to have a `catch` block inside an `if` statement.

```js
if (condition) {
    // ...
} catch (error) {
    console.log("Caught an error in block:", error.message);
} else {
    // here we are sure that there is no error in the block
    console.log("No error in block.");
}
```

### `if-catch` with `when` Clause

Like the previous example, but with a `when` clause to conditionally handle errors.

```js
if (condition) {
    throw new Error("Error in block");
} catch (error) when (error.message.includes("block")) {
    console.log("Caught an error in block:", error.message);
}
```

### `for-catch`

```js
for (let i = 0; i < 3; i++) {
    throw new Error("Error in block " + i);
} catch (error) when (error.message.includes("block 1")) {
    console.log("Caught an error in block 1:", error.message);
}
```

### `while-catch`

```js

let i = 0;
while (i < 3) {
    throw new Error("Error in block " + i);
} catch (error) when (error.message.includes("block 1")) {
    console.log("Caught an error in block 1:", error.message);
    i++;
}
```

### `function-catch`

Functions can have their own `catch` blocks.

```js
function fetchData() {
    throw new Error("Error in block");
} catch (error) when (error.message.includes("block")) {
    console.log("Caught an error in block:", error.message);
}
```

### `catch-catch`

Nested `catch` blocks can handle errors within error-handling logic.

```js
/* ... any block of statements ... */ {
    throw new Error("Error in block");
} catch (error) when (error.message.includes("block")) {
    console.log("Caught an error in block:", error.message);
} catch (nestedError) {
    console.log("Caught a nested error:", nestedError.message);
}
```

### `do-catch`

Catch exceptions must be before the `while` statement.

```js
do {
    throw new Error("Error in block");
} catch (error) when (error.message.includes("block")) {
    console.log("Caught an error in block:", error.message);
} while (false);
```

### `finally-catch`

Catch exceptions thrown in the `finally` block.

```js
try {
    throw new Error("Error in block");
} catch (error) when (error.message.includes("block")) {
    console.log("Caught an error in block:", error.message);
} finally {
    console.log("Finally block executed.");
    throw new Error("Error in finally block");
} catch (nestedError) {
    console.log("Caught a nested error:", nestedError.message);
}
```

### `try-catch-throw-catch`

Catch exceptions thrown in the `catch` block.

```js
try {
    throw new Error("Error in block");
} catch (error) when (error.message.includes("block")) {
    console.log("Caught an error in block:", error.message);
    throw new Error("Error in catch block");
} catch (nestedError) {
    console.log("Caught a nested error:", nestedError.message);
}
```

### `try-cath` with `if-catch-when` inside

Combine `try-catch` with `if-catch-when` inside.

```js
try {
    
    // ...
    if (condition) {
        throw new Error("Error in block");
    } catch (error) when (error.message.includes("block")) {
        
        // enter here if error.message.includes("block") is true
        // else the exception will be catched by the outer catch block
        console.log("Caught an error in if block:", error.message);
    }
    // ...

} catch (error) {
    console.log("Caught an error in try block:", error.message);
}
```

### `case-body-catch`

Catch exceptions thrown in the `case` block.

```js
switch (1) {
    case 1: {
        throw new Error("Error in block");
    } catch (error) when (error.message.includes("block")) {
        console.log("Caught an error in block:", error.message);
    }
}
```

## List of combinations

```js

// RO = risky operation
// BE = boolean expression

{ /* RO */ } catch;
{ /* RO */ } catch (e);
{ /* RO */ } catch (e) {  /* ... */  }
{ /* RO */ } catch (e) {  /* ... */  } catch (e) {  /* ... */  } /* ... */
{ /* RO */ } catch (e) {  /* ... */  } finally { /* ... */} /* ... */
{ /* RO */ } catch when ( /* BE */ );
{ /* RO */ } catch when ( /* BE */ ) { /* ... */} /* ... */
{ /* RO */ } catch when ( /* BE */ ) { /* ... */} finally { /* ... */ } /* ... */
{ /* RO */ } catch (e) when ( /* BE */ );
{ /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  }
{ /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } catch /* ... */
{ /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ }
{ /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ } catch /* ... */
/* ... */

if ( /* BE */ ) { /* RO */ } catch;
if ( /* BE */ ) { /* RO */ } catch (e);
if ( /* BE */ ) { /* RO */ } catch (e) {  /* ... */  }
if ( /* BE */ ) { /* RO */ } catch (e) {  /* ... */  } catch (e) {  /* ... */  } /* ... */
if ( /* BE */ ) { /* RO */ } catch (e) {  /* ... */  } finally { /* ... */} /* ... */
if ( /* BE */ ) { /* RO */ } catch when ( /* BE */ );
if ( /* BE */ ) { /* RO */ } catch when ( /* BE */ ) { /* ... */} /* ... */
if ( /* BE */ ) { /* RO */ } catch when ( /* BE */ ) { /* ... */} finally { /* ... */ } /* ... */
if ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ );
if ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  }
if ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } catch /* ... */
if ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ }
if ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ } catch /* ... */
if ( /* BE */ ) { /* RO */ } else { /* RO */ } catch;
if ( /* BE */ ) { /* RO */ } else { /* RO */ } catch (e);
if ( /* BE */ ) { /* RO */ } else { /* RO */ } catch (e) {  /* ... */  }
if ( /* BE */ ) { /* RO */ } else { /* RO */ } catch (e) {  /* ... */  } catch (e) {  /* ... */  } /* ... */
if ( /* BE */ ) { /* RO */ } else { /* RO */ } catch (e) {  /* ... */  } finally { /* ... */} /* ... */
if ( /* BE */ ) { /* RO */ } else { /* RO */ } catch when ( /* BE */ );
/* ... */

for ( /* RO */ ) { /* RO */ } catch;
for ( /* RO */ ) { /* RO */ } catch (e);
for ( /* RO */ ) { /* RO */ } catch (e) {  /* ... */  }
for ( /* RO */ ) { /* RO */ } catch (e) {  /* ... */  } catch (e) {  /* ... */  } /* ... */
for ( /* RO */ ) { /* RO */ } catch (e) {  /* ... */  } finally { /* ... */} /* ... */
for ( /* RO */ ) { /* RO */ } catch when ( /* BE */ );
for ( /* RO */ ) { /* RO */ } catch when ( /* BE */ ) { /* ... */} /* ... */
for ( /* RO */ ) { /* RO */ } catch when ( /* BE */ ) { /* ... */} finally { /* ... */ } /* ... */
for ( /* RO */ ) { /* RO */ } catch (e) when ( /* BE */ );
for ( /* RO */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  }
for ( /* RO */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } catch /* ... */
for ( /* RO */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ }
for ( /* RO */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ } catch /* ... */
/* ... */

while ( /* BE */ ) { /* RO */ } catch;
while ( /* BE */ ) { /* RO */ } catch (e);
while ( /* BE */ ) { /* RO */ } catch (e) {  /* ... */  }
while ( /* BE */ ) { /* RO */ } catch (e) {  /* ... */  } catch (e) {  /* ... */  } /* ... */
while ( /* BE */ ) { /* RO */ } catch (e) {  /* ... */  } finally { /* ... */} /* ... */
while ( /* BE */ ) { /* RO */ } catch when ( /* BE */ );
while ( /* BE */ ) { /* RO */ } catch when ( /* BE */ ) { /* ... */} /* ... */
while ( /* BE */ ) { /* RO */ } catch when ( /* BE */ ) { /* ... */} finally { /* ... */ } /* ... */
while ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ );
while ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  }
while ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } catch /* ... */
while ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ }
while ( /* BE */ ) { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ } catch /* ... */
/* ... */

do { /* RO */ } catch (e) while ( /* BE */ );
do { /* RO */ } catch (e) {  /* ... */  } while ( /* BE */ )
do { /* RO */ } catch (e)  when ( /* BE */) {  /* ... */  } catch (e) {  /* ... */  } while ( /* BE */ ) /* ... */
/* ... */

switch ( /* RO */ ) { case 1: { /* RO */ } catch; }
switch ( /* RO */ ) { case 1: { /* RO */ } catch when ( /* BE */ ) { /* ... */}
switch ( /* RO */ ) { case 1: { /* RO */ } catch when ( /* BE */ ) { /* ... */} finally { /* ... */ } }
/* ... */

function f() { /* RO */ } catch;
function f() { /* RO */ } catch (e);
function f() { /* RO */ } catch (e) {  /* ... */  }
function f() { /* RO */ } catch (e) {  /* ... */  } catch (e) {  /* ... */  } /* ... */
function f() { /* RO */ } catch (e) {  /* ... */  } finally { /* ... */} /* ... */
function f() { /* RO */ } catch when ( /* BE */ );
function f() { /* RO */ } catch when ( /* BE */ ) { /* ... */} /* ... */
function f() { /* RO */ } catch when ( /* BE */ ) { /* ... */} finally { /* ... */ } /* ... */
function f() { /* RO */ } catch (e) when ( /* BE */ );
function f() { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  }
function f() { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } catch /* ... */
function f() { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ }
function f() { /* RO */ } catch (e) when ( /* BE */ ) {  /* ... */  } finally { /* ... */ } catch /* ... */
/* ... */
```

## Analysis

### Alignment with Current Exception Handling

In JavaScript, when an exception is thrown, it is caught by the first catch block found in the hierarchy. This behavior remains consistent with the proposed changes. If a block does not catch the exception (either because it lacks a catch block or because the when condition evaluates to false), the exception will propagate up the call stack, where it can be caught by a higher-level catch block.

This ensures that the traditional flow of exception handling is preserved. The flexibility introduced by allowing any block to have a catch block (and potentially a `when` condition) simply extends this existing mechanism, giving developers more control over how and where exceptions are handled, without altering the fundamental principles of exception propagation.

### Importance of braces `{}`

While some proposals seek to move away from the traditional `try-catch` structure, often resorting to `if` statements or introducing new operators, this proposal embraces and expands upon the existing use of braces `{}` to maintain consistency with the current JavaScript syntax and control flow structures.

Braces `{}` are a fundamental part of JavaScript's syntax, serving as the primary means to define code blocks. By leveraging this familiar structure, the proposal ensures that developers can manage errors within the same framework they use for other control flows like `if`, `for`, and `while` loops.

### Importance of semi-colons

Semi-colons `;` are also a fundamental part of JavaScript's syntax, serving as the primary means to separate statements. In this proposal, is recommended to use semi-colons to separate statements, but is not mandatory. For example:

```js
{ throw new Error("Error in block") } catch

(1 + 1)
```

The previous code is valid, but is recommended to use semi-colons to separate statements, because the interpreter doesn't know if `( 1 + 1)` is part of the `catch` block or not. Then, the following code is recommended:

```js
{ throw new Error("Error in block") } catch; // <-- semicolon

(1 + 1)
```

### Control flow integrity

At its core, error handling is about controlling the flow of execution in the presence of unexpected conditions. By expanding the capabilities of blocks with optional `catch` and `finally` clauses, this proposal provides a powerful yet intuitive way to manage errors without introducing new or unfamiliar syntax. The focus remains on enhancing existing structures, ensuring that the language remains coherent and that the learning curve for developers is minimal.

### Avoiding redundant constructs

Moving away from `try-catch` often results in the use of `if` statements or other control structures that, while functional, can lead to redundant or less expressive code. This proposal addresses error handling in a more integrated manner, allowing developers to manage exceptions within the same block structure that controls their program's logic.

### A structural solution to a structural problem

Error handling is inherently about structuring your code to handle the unexpected. This proposal keeps the focus on structure by using control flow blocks, rather than introducing operators or new constructs that might disrupt the logical flow of code. By sticking with braces, we ensure that error handling remains a natural extension of the language's existing syntax and philosophy.

>[!IMPORTANT]
> Storing a value in memory is not the same as telling the interpreter what the next block of statements to execute is.

This proposal advocates for an evolution of JavaScript's error-handling capabilities that respects and enhances the language's foundational structures, ensuring that developers can write cleaner, more maintainable code without sacrificing familiarity or simplicity.

## Motivation and inspiration

Currently, JavaScript lacks the ability to type or conditionally handle errors directly in `catch` blocks, resulting in complex and less readable code. This proposal introduces a more precise and clear way to handle errors, inspired by similar features in languages ​​such as C#, F#, Scala, PL/pgSQL, Ruby, BASIC, Go, and Rust, as well as real-world scenarios where more granular error handling is needed.

1. **C# and F# `when` Clause**: Both C# and F# provide a `when` clause in their `catch` blocks, allowing developers to handle exceptions based on specific conditions. This inspired the idea of bringing a similar conditional mechanism to JavaScript.

    ```csharp
    try
    {
        // Code that may throw an error
    }
    catch (Exception ex) when (ex.Message.Contains("block"))
    {
        Console.WriteLine("Caught an error in block: " + ex.Message);
    }
    ```

2. **Scala's Pattern Matching in `catch`**: Scala's ability to use pattern matching within `catch` blocks, combined with conditional logic, influenced the design of conditional `catch` blocks with `when` in this proposal.

    ```scala
    try {
        // Code that may throw an error
    } catch {
        case ex: Exception if ex.getMessage.contains("block") =>
            println(s"Caught an error in block: ${ex.getMessage}")
    }
    ```

3. **PL/pgSQL's `EXCEPTION` Handling**: In PL/pgSQL, the EXCEPTION section within functions allows for specific error handling based on the type of exception, providing a structured approach to managing errors in procedural code. This inspired the idea of enhancing JavaScript's error handling within blocks and functions.

    ```sql
    BEGIN
        -- Code that may throw an error
    EXCEPTION
        WHEN OTHERS THEN
            -- Error-handling logic
    END;
    ```

4. **BASIC's `On Error` Statement**: The `On Error` mechanism in BASIC languages like Visual Basic offers a way to direct the flow of control when an error occurs, similar to the concept of catch blocks. This inspired the proposal to allow more flexible and conditional error handling in JavaScript.

    ```basic
    On Error Goto ErrorHandler
    ' Code that may throw an error
    Exit Sub
    ErrorHandler:
    ' Error-handling logic
    ```

5. **Ruby's `rescue` with Conditions**: Ruby's elegant error-handling using `rescue`, which can include conditional logic within the block, inspired the flexibility and readability goals of this proposal.

    ```ruby
    begin
        # Code that may throw an error
    rescue => e
        puts "Caught an error: #{e.message}" if e.message.include?("block")
    end
    ```

6. **Go an Rust**: Go and Rust allow to catch errors inline, but `catch` is for control flow, and is important keep this principle. To maintain the control flow, the `catch` block in this proposal is optional, and the error variable is available in the same scope as the catch block.

    ```go
    // Go
    if num, err := strconv.Atoi("123a"); err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("Number:", num)
    }
    ```

    ```rust
    // Rust
    let num = "123a".parse::<i32>();

    if let Err(e) = num {
        println!("Error: {}", e);
    } else {
        println!("Number: {}", num.unwrap());
    }
    ```

7. **Real-World Scenarios**: The need for more granular control over error handling in complex JavaScript applications highlighted the limitations of the current `try-catch` structure and motivated the development of this more flexible approach.

By synthesizing these ideas and experiences from various languages and systems, this proposal aims to provide a more powerful and flexible approach to error handling in JavaScript, while maintaining the simplicity and dynamism that the language is known for.

## References

1. Crockford, Douglas. _JavaScript: The Good Parts_. O'Reilly Media, 2008. ISBN: 978-0596517748.

2. Simpson, Kyle. _You Don't Know JS: Scope & Closures_. O'Reilly Media, 2014. ISBN: 978-1449335588.

3. Hunt, Andrew, and David Thomas. _The Pragmatic Programmer: Your Journey to Mastery_. Addison-Wesley Professional, 1999. ISBN: 978-0201616224.

4. Scott, Michael L. _Programming Language Pragmatics_. Morgan Kaufmann, 2009. ISBN: 978-0123745149.

5. McConnell, Steve. _Code Complete: A Practical Handbook of Software Construction_. Microsoft Press, 2004. ISBN: 978-0735619678.

6. Flanagan, David. _JavaScript: The Definitive Guide_. O'Reilly Media, 2020. ISBN: 978-1491952023.

7. W3Schools. "JavaScript Errors - Throw and Try to Catch". [https://www.w3schools.com/js/js_errors.asp](https://www.w3schools.com/js/js_errors.asp)

8. Mozilla Developer Network. "Error". [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

9. Microsoft Docs. "try-catch (C# Reference)". [https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/try-catch](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/try-catch)

10. Scala Documentation. "Functional Error Handling". [https://docs.scala-lang.org/scala3/book/fp-functional-error-handling.html](https://docs.scala-lang.org/scala3/book/fp-functional-error-handling.html)

11. PostgreSQL Documentation. "PL/pgSQL - Error Handling". [https://www.postgresql.org/docs/13/plpgsql-control-structures.html#PLPGSQL-ERROR-TRAPPING](https://www.postgresql.org/docs/13/plpgsql-control-structures.html#PLPGSQL-ERROR-TRAPPING)

12. Ruby Documentation. "Exceptions". [https://ruby-doc.org/core-3.0.2/doc/syntax/exceptions_rdoc.html](https://ruby-doc.org/core-3.0.2/doc/syntax/exceptions_rdoc.html)

13. BASIC Programming Language. "On Error Statement". [https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/on-error-statement](https://docs.microsoft.com/en-us/office/vba/language/reference/user-interface-help/on-error-statement)

14. The Go Programming Language. "Error Handling". [https://golang.org/doc/effective_go#errors](https://golang.org/doc/effective_go#errors)

15. The Rust Programming Language. "Error Handling". [https://doc.rust-lang.org/book/ch09-00-error-handling.html](https://doc.rust-lang.org/book/ch09-00-error-handling.html)

16. JavaScript Standard ECMA-262. [https://tc39.es/ecma262](https://tc39.es/ecma262/)

## Author

Rafael Rodríguez Ramírez
<rafageist@divengine.com>
[rafageist.com](https://rafageist.com)

## License

This proposal is licensed under the [MIT License](./LICENSE).
