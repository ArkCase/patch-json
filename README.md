# Patch JSON

Patch JSON is utility and YAML-based language to make changes over JSON and produce new updated JSON.

## Contents
- [Introduction](#introduction)
- [Getting started](#getting-started)
- [Usage](#usage)
- Actions
    - [Common actions](#common-actions)
        - [SET](#set)
        - [UNSET](#unset)
    - [Array actions](#array-actions)
        - [PUSH](#push)
        - [UNSHIFT](#unshift)
- [API](#api)
    - [Methods](#methods)
    - [Errors](#errors)
- [References](#references)


## Introduction
You can use few approaches to reach element from JSON object.

```json
    {
        "component": {
            "menu": {
                "title": "File Menu",
                "items": [
                    {"id": "open", "title": "open"},
                    {"id": "close", "title": "close"}
                ]
            }
        }
    }
```

1. Dot notation. This approach is recommended only for simple cases, that don't require any expressions. For instance:
    * Getting menu title:  **component.menu.title**
    * Getting "open" item of menu: **component.menu.items[0]**
    
2. JSONPath notation. More powerfull notation that allows us to use expressions to get element:
     * Getting menu title: **$.component.menu.title**
     * Getting "open" item of menu: **$.component.menu.items[?(@.id === 'open')]**

Common patch structure:
```yaml
    component.menu.title:
        - ACTION: <ACTION NAME>
        [ VALUE: <VALUE> ]
        - ACTION: <ACTION NAME>
    component.menu:
        - ACTION: <ACTION NAME>
        [ VALUE: <VALUE> ]
        - ACTION: <ACTION NAME>
```
This structure defines sequence of actions that should applied to json.

## Getting started
Instal json-patch into the project:

```
npm install patch-json --save
```

or

```
yarn add patch-json
```

## Usage
Let's take a look at example of patch-json usage:

```javascript
const fs = require('fs');
const jsonPatch = require('patch-json');

let jsonContent = fs.readFileSync('content.json');
let patch = fs.readFileSync('patch.yaml');
// Apply patch to loaded json data:
let newJson = jsonPatch.patch(jsonContent, patch);
```


## Common actions
### SET
Add new or modify exists node of the JSON object.

**Parameters**
* **ACTION:**  SET
* **VALUE** - {any} New value

```yaml
component.menu:
  - ACTION: SET
    VALUE:
      newProperty:
        prop1: value1
```

### UNSET
Remove node from JSON object

**Parameters**
* **ACTION:**  UNSET

```yaml
component.menu.title:
  - ACTION: REMOVE
```

## Array actions
These actions can be applied only to the arrays.

### PUSH
Append new item to the end of an array

**Parameters**
* **ACTION:**  PUSH
* **VALUE** - {any} New value

```yaml
component:
    ACTION: PUSH
    VALUE:
        newProperty:
            prop1: value1
```

### UNSHIFT
Add item to the beginning of an array

**Parameters**
* **ACTION:**  UNSHIFT
* **VALUE** - {any} New value

```yaml
component:
    ACTION: UNSHIFT
    VALUE:
        newProperty:
            prop1: value1
```

## API
### Methods
**patch(jsonString, yamlString) -> Object**


**validate(yamlString) -> Boolean**

### Errors
Patch JSON uses exceptions throwing to process any errors.
Error object contains **name** property that defines type of error:
1. JSON_VALIDATION_ERROR
1. YAML_VALIDATION_ERROR
1. YAML_STRUCTURE_ERROR
1. PATCH_ERROR

Also it contains **message** and **stack** properties to get additional info about error.


```javascript
    try {
        jsonPath.patch(jsonString, yamlString)
    } catch(ex) {
        if (ex.name === 'JSON_VALIDATION_ERROR') {
        
        } else if (ex.name === 'YAML_VALIDATION_ERROR') {
        
        } else if (ex.name === 'YAML_STRUCTURE_ERROR') {
        
        } else if (ex.name === 'PATCH_ERROR') {
        }
    
    }
```


## References
1. [JSONPath](https://github.com/dchester/jsonpath)
