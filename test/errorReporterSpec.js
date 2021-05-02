
describe('Error Reporter', () => {

  onWorkspace('should report type error', workspace => {
    newFunction(workspace, 'even', stringToBlock(workspace, "Hello"))
    
    assertErrorReported('Se esperaba Number pero se obtuvo String') 
  })

  onWorkspace('should report reduction error', workspace => {
    const six = numberToBlock(workspace, 6)
    const hello = stringToBlock(workspace, "Hello")
    const charAt0Hello = newFunction(workspace, 'charAt', six, hello)

    charAt0Hello.reduce()

    assertErrorReported('Posición fuera de límites') 
  })
})