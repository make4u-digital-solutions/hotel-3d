/**
 * ChunkManager Module (Compatibility Wrapper)
 *
 * Re-exports the advanced progressive FrameManager.
 */

export {
  FrameManager as ChunkManager,
  FrameManager,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_PREFETCH_THRESHOLD,
} from "./frameManager";
