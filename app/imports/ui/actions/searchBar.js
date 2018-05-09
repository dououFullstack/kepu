export default {
  searchSubmit ({ Meteor, LocalState }, value) {
    LocalState.set('searchTerm', value)
  }
}
