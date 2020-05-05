function allReplaced(originalType, ...otherTypes) {
  return otherTypes.reduce(({typeNamesUsed, replacements, newTypes}, type) =>
  {
    const newReplacements = renamesFor(typeNamesUsed, type)
    return {
      typeNamesUsed: [...typeNamesUsed, ...Object.values(newReplacements), ...type.allTypeVariableNamesUsed()],
      replacements: {...replacements, newReplacements},
      newTypes: newTypes.concat([type.replacing(newReplacements)])
    }
  },
    { typeNamesUsed: originalType.allTypeVariableNamesUsed(), replacements: {}, newTypes: []})
}

function renamesFor(typeVariableNamesAlreadyUsed, type) {
  const conflictingTypeNames = [...new Set(intersect(typeVariableNamesAlreadyUsed, type.allTypeVariableNamesUsed()))] 

  const renames = {}

  conflictingTypeNames.forEach(typeName => {
    const allUsedTypeNames = typeVariableNamesAlreadyUsed + Object.values(renames)
    renames[typeName] = getUnusedName(allUsedTypeNames, typeName)
  })

  return mapValues(createType)(renames)
}

function getUnusedName(typeVariableNamesAlreadyUsed, actualType) {
  const isNameUsed = (typeName) => typeVariableNamesAlreadyUsed.indexOf(typeName) != -1
	const newName = (typeName) => i == 0 ? typeName : typeName + i;
  
  for(i = 0; isNameUsed(newName(actualType)); i++);

  return newName(actualType);
}

function renameTypeMatches(fullUnappliedType, actualTypes) {
  return allReplaced(fullUnappliedType, ...actualTypes).newTypes
}