<script setup lang="ts">
import { ref } from "vue";
import TxMap from "@/components/TxMap/TxMap.vue";

const addressCoordinates = ref<number[]>([
  39.98328588704939, 116.30670979290676,
]);
</script>

<template>
  <TxMap :addressCoordinates="addressCoordinates" />
</template>

<style lang="scss" scoped></style>
