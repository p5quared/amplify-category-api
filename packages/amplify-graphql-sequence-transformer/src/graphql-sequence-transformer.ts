import { SequenceDirectiveConfiguration } from './types';

import {
  DirectiveWrapper,
  generateGetArgumentsInput,
  InputObjectDefinitionWrapper,
  InvalidDirectiveError,
  isPostgresModel,
  TransformerPluginBase,
} from '@aws-amplify/graphql-transformer-core';
import {
  TransformerSchemaVisitStepContextProvider,
  TransformerTransformSchemaStepContextProvider,
} from '@aws-amplify/graphql-transformer-interfaces';
import { SequenceDirective } from '@aws-amplify/graphql-directives';
import { DirectiveNode, FieldDefinitionNode, InterfaceTypeDefinitionNode, Kind, ObjectTypeDefinitionNode } from 'graphql';
import { getBaseType, ModelResourceIDs } from 'graphql-transformer-common';
import { ERR_ARGC, ERR_NOT_INT, ERR_NOT_MODEL, ERR_NOT_POSTGRES } from './err';

const validateModelDirective = (config: SequenceDirectiveConfiguration): void => {
  const modelDirective = config.object.directives!.find((dir) => dir.name.value === 'model');
  if (!modelDirective) {
    throw new InvalidDirectiveError(ERR_NOT_MODEL);
  }
};

//const validateDirectiveArguments = (directive: DirectiveNode): void => {
//  if (directive.arguments!.length > 0) throw new InvalidDirectiveError(ERR_ARGC);
//};

const validateFieldType = (config: SequenceDirectiveConfiguration): void => {
  const baseTypeName = getBaseType(config.field.type);
  if (baseTypeName !== 'Int') {
    throw new InvalidDirectiveError(ERR_NOT_INT);
  }
};

const validate = (ctx: TransformerSchemaVisitStepContextProvider, config: SequenceDirectiveConfiguration): void => {
  //validateModelDirective(config);
  //validateFieldType(config);
  //validateDirectiveArguments(config.directive);
  //const isPostgres = isPostgresModel(ctx, config.object.name.value);
  //if (!isPostgres) {
  //  throw new InvalidDirectiveError(ERR_NOT_POSTGRES);
  //}
};

export class SequenceTransformer extends TransformerPluginBase {
  private directiveMap = new Map<string, SequenceDirectiveConfiguration[]>();

  constructor() {
    super('amplify-sequence-transformer', SequenceDirective.definition);
  }

  field = (
    parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    definition: FieldDefinitionNode,
    directive: DirectiveNode,
    ctx: TransformerSchemaVisitStepContextProvider,
  ): void => {
    const directiveWrapped = new DirectiveWrapper(directive);
    const config = directiveWrapped.getArguments(
      {
        object: parent as ObjectTypeDefinitionNode,
        field: definition,
        directive,
      } as SequenceDirectiveConfiguration,
      generateGetArgumentsInput(ctx.transformParameters),
    );
    validate(ctx, config);

    if (!this.directiveMap.has(parent.name.value)) {
      this.directiveMap.set(parent.name.value, []);
    }

    this.directiveMap.get(parent.name.value)!.push(config);
  };

  transformSchema = (ctx: TransformerTransformSchemaStepContextProvider): void => {
    for (const typeName of this.directiveMap.keys()) {
      const name = ModelResourceIDs.ModelCreateInputObjectName(typeName);
      for (const config of this.directiveMap.get(typeName)!) {
        const inputObject = InputObjectDefinitionWrapper.fromObject(name, config.object, ctx.inputDocument);
        const appliedField = inputObject.fields.find((f) => f.name === config.field.name.value);
        appliedField!.makeNullable();

        ctx.output.updateInput(inputObject.serialize());
      }
    }
  };
}
