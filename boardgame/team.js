class Team {
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

class TeamBuilder {
    constructor() {
        this._name = null;
        this._color = null;
    }

    name(n) {
        if (this._name !== null)
            throw Error('Cannot double assign team name.');
        this._name = n;
        return this;
    }

    color(x) {
        if (this._color !== null)
            throw Error('Cannot double assign team color.');
        this._color = x;
        return this;
    }

    build() {
        return new Team(this._name, this._color);
    }
}