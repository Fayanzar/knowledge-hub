<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import { BookmarkIcon, PencilIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  resourceId: number,
  url: string
}>();

const emit = defineEmits<{
  urlChanged: [id: number, url: string]
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

const url = ref(props.url);

async function validateAndSave(id: number) {
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      console.error("bad url");
      return false;
    }
  }

  if (url.value == props.url) return;

  if (isValidUrl(url.value)) {
    emit("urlChanged", id, url.value)
  } else {
    isEditing.value = true;
    url.value = props.url;
    await nextTick();
    editInput.value?.focus();
    editInput.value?.classList.add("input-error");
  }
}
</script>

<template>
  <component :is="BookmarkIcon" class="h-5 w-6 shrink-0"/>
  <span v-if="!isEditing" class="items-center rounded-lg transition-colors gap-1 text-ellipsis overflow-hidden whitespace-nowrap inline-block w-30">
    {{ url }}
  </span>

  <input v-else
    type="text"
    v-model="url"
    @blur="toggleEditMode(); validateAndSave(resourceId)"
    ref="editInput"
    class="w-30 input h-6"
  />
  <button @click="toggleEditMode" class="btn -translate-y-3 h-5 w-5 shrink-0 btn-ghost pr-0 pl-0">
    <component :is="PencilIcon" class="shrink-0 h-4 w-4"/>
  </button>
</template>
