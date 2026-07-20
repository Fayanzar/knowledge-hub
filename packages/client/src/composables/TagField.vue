<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue';
import { PencilIcon } from '@heroicons/vue/24/outline';
import { TrashIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
  tagId: number,
  tagValue: string
}>();

const emit = defineEmits<{
  tagChanged: [id: number, val: string],
  tagDeleted: [id: number]
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

async function deleteTag(tid: number) {
  emit("tagDeleted", tid);
}
</script>

<template>
  <span v-if="!isEditing">
    {{ tagValue }}
  </span>

  <input v-else
    type="text"
    v-model="tagValue"
    @blur="toggleEditMode(); validateAndSave(tagId)"
    ref="editInput"
    class="w-30 input h-6"
  />
  <button @click="toggleEditMode" class="btn btn-ghost absolute translate-y-3 h-5 w-5 shrink-0 pr-0 pl-0 right-0">
    <component :is="PencilIcon" class="shrink-0 h-4 w-4"/>
  </button>
  <button v-if="isEditing" @mousedown.prevent="deleteTag(tagId)" class="btn btn-ghost absolute -translate-y-3 h-5 w-5 shrink-0 pr-0 pl-0 right-0">
    <component :is="TrashIcon" class="shrink-0 h-4 w-4"/>
  </button>
</template>
