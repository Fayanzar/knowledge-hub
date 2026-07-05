<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue';

const props = defineProps<{
  tagId: number,
  tagValue: string
}>();

const emit = defineEmits<{
  tagChanged: [id: number, val: string]
}>();

const isEditing = ref(false);
const editInput = useTemplateRef("editInput");

const toggleEditMode = async () => {
  isEditing.value = !isEditing.value;

  if (isEditing.value) {
    await nextTick();
    if (editInput.value != null)
      editInput.value.focus();
  }

};

const tagValue = ref(props.tagValue);

async function validateAndSave(id: number) {
  if (tagValue.value == props.tagValue) return;
  emit("tagChanged", id, tagValue.value)
}
</script>

<template>
  <span v-if="!isEditing"
    @click="toggleEditMode">
    {{ tagValue }}
  </span>

  <input v-else
    type="text"
    v-model="tagValue"
    @blur="toggleEditMode(); validateAndSave(tagId)"
    ref="editInput"
    class="w-30 input h-6"
  />
</template>
