// schema
export const schema = `
# owner identity specified explicitly on every object
type Post @model @auth(rules: [{ allow: owner, operations: [create] }]) {
  id: ID!
  title: String!
}

##auth/owner3`;
// mutations
export const mutation = `
mutation CreatePost(
    $input: CreatePostInput!
    $condition: ModelPostConditionInput
  ) {
    createPost(input: $input, condition: $condition) {
      id
      title
      createdAt
      updatedAt
    }
}`;
export const input_mutation = {
  input: {
    id: '1',
    title: 'title1',
  },
};
export const expected_result_mutation = {
  data: {
    createPost: {
      id: '1',
      title: 'title1',
      createdAt: '<check-defined>',
      updatedAt: '<check-defined>',
    },
  },
};
