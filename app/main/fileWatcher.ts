import chokidar, { FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';

export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private pausedPaths = new Set<string>();

  start(folderPath: string) {
    this.watcher = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\../,  // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,        // Don't emit for existing files
      awaitWriteFinish: {
        stabilityThreshold: 2000,  // Wait 2s for file write to finish
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filePath) => {
        if (!this.pausedPaths.has(filePath)) {
          this.emit('add', filePath);
        }
      })
      .on('change', (filePath) => {
        if (!this.pausedPaths.has(filePath)) {
          this.emit('change', filePath);
        }
      })
      .on('unlink', (filePath) => {
        if (!this.pausedPaths.has(filePath)) {
          this.emit('delete', filePath);
        }
      });
  }

  pause(filePath: string, ms = 5000) {
    this.pausedPaths.add(filePath);
    setTimeout(() => this.pausedPaths.delete(filePath), ms);
  }

  stop() {
    this.watcher?.close();
  }
}
