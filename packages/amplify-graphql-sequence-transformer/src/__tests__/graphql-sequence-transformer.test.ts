import { ModelTransformer } from '@aws-amplify/graphql-model-transformer';
import { testTransform } from '@aws-amplify/graphql-transformer-test-utils';
import { SequenceTransformer } from '../graphql-sequence-transformer';
import { ERR_NOT_MODEL } from '../err';

describe('DefaultValueModelTransformer:', () => {
  it('throws if @default is used in a non-@model type', () => {
    const schema = `
      type Test {
        id: ID! @sequence
        name: String
      }`;

    expect(() =>
      testTransform({
        schema,
        transformers: [new ModelTransformer(), new SequenceTransformer()],
      }),
    ).toThrow(ERR_NOT_MODEL);
  });
});
