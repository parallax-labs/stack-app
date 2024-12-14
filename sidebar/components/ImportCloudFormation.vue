<template>
  <div class="p-4">
    <h2 class="text-lg font-bold mb-4">Import CloudFormation Template</h2>
    <input type="file" @change="handleFileUpload" accept=".yaml, .yml, .json" />
    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { parseCloudFormation, generateAwsLink } from '../cf';
import { upsertResource } from '../db';

const error = ref<string | null>(null);

const handleFileUpload = async (event: Event) => {
  error.value = null;
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const content = reader.result as string;
      const template = parseCloudFormation(content);

      const resources = template.Resources;
      if (!resources) {
        error.value = 'No resources found in the template';
        return;
      }

      const stackName = prompt('Enter stack name:');
      if (!stackName) return;

      for (const [logicalId, resource] of Object.entries(resources)) {
        const { Type, Properties } = resource as any;
        const url = generateAwsLink(Type, logicalId);
        if (url) {
          await upsertResource({
            name: logicalId,
            type: Type,
            url,
            stack: stackName,
          });
        }
      }

      console.log('Resources imported successfully!');
    } catch (err) {
      error.value = `Error: ${err}`;
    }
  };

  reader.readAsText(file);
};
</script>

<style scoped>
input[type="file"] {
  display: block;
  margin-bottom: 1rem;
}
</style>
