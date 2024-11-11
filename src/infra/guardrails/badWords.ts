import { Filter } from "bad-words";

const BAD_WORDS = [];

export class BadWords {
  private filter: Filter;

  constructor() {
    this.filter = new Filter();
    this.filter.addWords();
  }
}

// todo o que eu faço aqui
