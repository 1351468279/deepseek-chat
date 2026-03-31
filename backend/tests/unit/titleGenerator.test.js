import { describe, it, expect } from 'vitest';
import { generateTitle } from '../../src/utils/titleGenerator.js';

describe('titleGenerator Utility', () => {
  it('should generate title from short message', () => {
    const message = 'Hello world';
    const title = generateTitle(message);
    expect(title).toBe('Hello world');
  });

  it('should truncate long message at 40 characters', () => {
    const message = 'a'.repeat(50);
    const title = generateTitle(message);
    expect(title.length).toBe(40);
  });

  it('should truncate at word boundary', () => {
    const message = 'The quick brown fox jumps over the lazy dog and runs away';
    const title = generateTitle(message);
    // Should not cut in the middle of a word if possible
    expect(title).not.toContain('jumps');
    expect(title.endsWith('...')).toBe(true);
  });

  it('should handle empty message', () => {
    const title = generateTitle('');
    expect(title).toBe('New Chat');
  });

  it('should handle whitespace-only message', () => {
    const title = generateTitle('   ');
    expect(title).toBe('New Chat');
  });

  it('should strip HTML from message', () => {
    const message = '<script>alert("xss")</script>Hello world';
    const title = generateTitle(message);
    expect(title).not.toContain('<script>');
    expect(title).toContain('Hello world');
  });

  it('should handle single word', () => {
    const title = generateTitle('Hello');
    expect(title).toBe('Hello');
  });

  it('should handle message with punctuation', () => {
    const message = 'Hello, world! How are you?';
    const title = generateTitle(message);
    expect(title).toBe('Hello, world! How are you?');
  });
});
