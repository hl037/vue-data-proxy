vue-data-proxy
==============

This package provides `vueDataProxy()` to generate a two-way bindable
computed property from the result of a user\'s `fetch` function (e.g. to
retrieve the object from a Vuex store), that calls back a user\'s
`commit` function on any change on the object, even deeply nested.

Motivation
----------

This package, even if it doesn\'t limit its scope to the Vuejs / Vuex
environment, was initially design to provide a simple way to get deep
two way binding with Vuex. At the end, it can finally work with any type
of datastore as long as they use Vue\'s reactivity system.

It can also be used without Vue at all as a starting point of a MVC
system.

Related works
-------------

There are already a wide variety of utilities to deal with two-way
bindings with Vuex store. However, none of them addresses the problem of
dealing with nested substate, and having deep reactivity. For example,
suppose you have this store :

``` {.sourceCode .javascript}
export default new Vuex.Store({
  state: {
    users : [
      { name : 'foo', category : 'bar' },
      // ...
    ]
  },
  mutations : {
     updateUser(state, {id, name, category}){
       state.users[id].name = name;
       state.users[id].category = category;
     }
  }
```

With the [official
Vuex\'](https://vuex.vuejs.org/guide/forms.html#two-way-computed-property)
recommended way, you would have to declare two computed property, one
for `name` and one for `category`, both calling the same mutation to
update.

With [Vuex\'s
mapState](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper),
it would be less verbose, but you\'d still have to define a method and
both the computed properties.

With
[vuex-bound](https://github.com/Vanilla-IceCream/vuex-bound#readme), it
would be even shorter, but still need you to define each property one by
one.

[vuex-dot](https://github.com/yarsky-tgz/vuex-dot#readme) introduces an
interresting way to do what the previous one does using a dot-synthax.
However, it still does not handle the nested case.

Contribution
------------

This package addresses the problem of deep nested two-way binding by
providing a function that generate a two-way bound computed property
definition. Considering the previous example, you would simply wirte the
following (let\'s suppose you write a .vue component :)

``` {.sourceCode .xml}
<template>
  <input v-model="user.name" placeholder="user's name"/>
  <input v-model="user.category" placeholder="user's category"/>
</template>
```

``` {.sourceCode .javascript}
import vueDataProxy from 'vue-data-proxy';
export default {
  computed : {
    ...vueDataProxy({
      user : {
        fetch() { return this.$store.state.input[this.userId] },
        commit(newVal){ this.$store.commit('updateUser', {id : this.userId, name : newVal.name, category : newVal.category}) },
      }
    }),
  }
  props : {
    userId : Number,
  },
},
```

Limitations
-----------

Since the code is greatly inpired by Vue\'s reactivity system, it does
have the same limitations. For example, it won\'t detect property
addition nor array `[]` synthax assigment. However, you can use the
array\'s method that Vue reactvity system is compatible with.
(`splice()`, `push()`, `pop()`, \[\...\])

Another limitation, if you want the computed property nested attribute
to be reactive, always access the computed property first. For example,
the folowing wouldn\'t work :

``` {.sourceCode .javascript}
var alias // global scope alias
//[...]
  methods : {
    genAlias(){
      alias = this.user.name;
    }
  computed : {
    ...vueDataProxy({
      user : {
        fetch() { return this.$store.state.input[this.userId] },
        commit(newVal){ this.$store.commit('updateUser', {id : this.userId, name : newVal.name, category : newVal.category}) },
      }
    }),
    name() { return alias } // not reactive because user is not a dependency
    name2() { _ = this.user; return alias } // Reactive because even alias is accessed without accessing this.user, the _ variable marks this.user as a dependency, and force recomputation. (note you'd still need to regenerate the alias...)
  }
```

Installation
============

With a build system
-------------------

``` {.sourceCode .}
npm install --save vue-data-proxy
```

Wherever you need it:

``` {.sourceCode .javascript}
import vueDataProxy from 'vue-data-proxy'
```

(Re)build
---------

The needed files are already provided in `dist/`, but if you want to re
build, simlply run :

``` {.sourceCode .}
npm run build
```

Directely in html
-----------------

``` {.sourceCode .html}
<script src="vueDataProxy.min.js"></script>
```

API
===

`vueDataProxy(params)`

:   

    `params` is an object. Each key represent a proxy definition (a resulting computed property). Each value should be an object with the following fields :

    :   -   `fetch` : A function with no arguments, `this` representing
            the Vue local component instance. Should return the store
            object value.
        -   `commit` : A function called at each modification (on the
            returned object from the computed property), taking the new
            value as parameter, and this representing the Vue local
            component.

License
-------

This code is provided as-is, under the terms of the MIT license (see
License file for more details).

A link to the original sources and contribution / pull request are
welcome if you enjoy / use / contribute to this module ! :)
