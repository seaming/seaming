class MovesetBuilder {
    constructor() {
        this.rules = [];
    }

    manhattan_distance(dist) {
        this.rules.push((board, piece, x, y) => {
            let dx = Math.abs(x - piece.x);
            let dy = Math.abs(y - piece.y);
            return dx + dy == dist;
        });
        return this;
    }

    max_manhattan_distance(max_dist) {
        this.rules.push((board, piece, x, y) => {
            let dx = Math.abs(x - piece.x);
            let dy = Math.abs(y - piece.y);
            return dx + dy <= max_dist;
        });
        return this;
    }

    diagonal_distance(dist) {
        this.rules.push((board, piece, x, y) => {
            let dx = Math.abs(x - piece.x);
            let dy = Math.abs(y - piece.y);
            return Math.max(dx, dy) == dist;
        });
        return this;
    }

    max_diagonal_distance(max_dist) {
        this.rules.push((board, piece, x, y) => {
            let dx = Math.abs(x - piece.x);
            let dy = Math.abs(y - piece.y);
            return Math.max(dx, dy) <= max_dist;
        });
        return this;
    }

    signed_x_delta(dx) {
        this.rules.push((board, piece, x, y) => {
            let _dx = x - piece.x;
            return dx == _dx;
        });
        return this;
    }

    signed_y_delta(dy) {
        this.rules.push((board, piece, x, y) => {
            let _dy = y - piece.y;
            return dy == _dy;
        });
        return this;
    }

    signed_xy_delta(dx, dy) {
        this.rules.push((board, piece, x, y) => {
            let _dx = x - piece.x;
            let _dy = y - piece.y;
            return dx == _dx && dy == _dy;
        });
        return this;
    }

    unsigned_x_delta(dx) {
        this.rules.push((board, piece, x, y) => {
            let _dx = Math.abs(x - piece.x);
            return dx == _dx;
        });
        return this;
    }

    unsigned_y_delta(dy) {
        this.rules.push((board, piece, x, y) => {
            let _dy = Math.abs(y - piece.y);
            return dy == _dy;
        });
        return this;
    }

    unsigned_xy_delta(dx, dy) {
        this.rules.push((board, piece, x, y) => {
            let _dx = Math.abs(x - piece.x);
            let _dy = Math.abs(y - piece.y);
            return dx == _dx && dy == _dy;
        });
        return this;
    }

    fix_x() {
        this.unsigned_x_delta(0);
        return this;
    }

    fix_y() {
        this.unsigned_y_delta(0);
        return this;
    }

    orthogonal() {
        this.rules.push((board, piece, x, y) => {
            let dx = x - piece.x;
            let dy = y - piece.y;
            return dx == 0 || dy == 0;
        });
        return this;
    }

    diagonal() {
        this.rules.push((board, piece, x, y) => {
            let dx = Math.abs(x - piece.x);
            let dy = Math.abs(y - piece.y);
            return dx == dy;
        });
        return this;
    }

    clear_relative_tile(dx, dy) {
        // requires that a tile at a specified relative position is clear
        this.rules.push((board, piece, x, y) => board.piece_map[[piece.x + dx, piece.y + dy]] == undefined);
        return this;
    }

    clear_orthogonal() {
        this.rules.push((board, piece, x, y) => {
            if (piece.x == x) {
                return range(y, piece.y).slice(1, -1).every(n => board.piece_map[[x, n]] == undefined);
            } else if (piece.y == y) {
                return range(x, piece.x).slice(1, -1).every(n => board.piece_map[[n, y]] == undefined);
            }
            return false;
        });
        return this;
    }

    clear_diagonal() {
        this.rules.push((board, piece, x, y) => {
            let dx = Math.abs(x - piece.x);
            let dy = Math.abs(y - piece.y);

            if (dx == dy) {
                let xs = range(x, piece.x).slice(1, -1)
                let ys = range(y, piece.y).slice(1, -1)
                return xs.map((x, i) => [x, ys[i]]).every(i => board.piece_map[i] == undefined);
            }

            return false;
        });
        return this;
    }

    x_condition(g) {
        this.rules.push((board, piece, x, y) => g(piece.x));
        return this;
    }

    y_condition(g) {
        this.rules.push((board, piece, x, y) => g(piece.y));
        return this;
    }

    xy_condition(g) {
        this.rules.push((board, piece, x, y) => g(piece.x, piece.y));
        return this;
    }

    x_constraint(g) {
        this.rules.push((board, piece, x, y) => g(x));
        return this;
    }

    y_constraint(g) {
        this.rules.push((board, piece, x, y) => g(y));
        return this;
    }

    xy_constraint(g) {
        this.rules.push((board, piece, x, y) => g(x,y));
        return this;
    }

    nobody_at(x, y) {
        this.rules.push((board, piece, _x, _y) => board.piece_map[[x, y]] == undefined);
        return this;
    }

    nobody_at_relative(dx, dy) {
        this.rules.push((board, piece, x, y) => board.piece_map[[x + dx, y + dy]] == undefined);
        return this;
    }

    nobody_at_destination() {
        this.rules.push((board, piece, x, y) => board.piece_map[[x, y]] == undefined);
        return this;
    }

    teammate_at(x, y) {
        this.rules.push((b, p, _x, _y) => b.piece_map[[x, y]] != undefined && b.pieces[b.piece_map[[x, y]]].team == p.team);
        return this;
    }

    teammate_at_destination() {
        this.rules.push((b, p, x, y) => b.piece_map[[x, y]] != undefined && b.pieces[b.piece_map[[x, y]]].team == p.team);
        return this;
    }

    teammate_at_relative(dx, dy) {
        this.rules.push((b, p, x, y) => b.piece_map[[x + dx, y + dy]] != undefined && b.pieces[b.piece_map[[x + dx, y + dy]]].team == p.team);
        return this;
    }

    teammate_at_signed_dx(dx) {
        this.rules.push((b, p, x, y) => b.piece_map[[x + dx, y]] != undefined && b.pieces[b.piece_map[[x + dx, y]]].team == p.team);
        return this;
    }

    teammate_at_unsigned_dx(dx) {
        this.rules.push((b, p, x, y) =>
            (b.piece_map[[x + dx, y]] != undefined && b.pieces[b.piece_map[[x + dx, y]]].team == p.team)
         || (b.piece_map[[x - dx, y]] != undefined && b.pieces[b.piece_map[[x - dx, y]]].team == p.team)
        );
        return this;
    }

    teammate_at_signed_dy(dy) {
        this.rules.push((b, p, x, y) => b.piece_map[[x, y + dy]] != undefined && b.pieces[b.piece_map[[x, y + dy]]].team == p.team);
        return this;
    }

    teammate_at_unsigned_dy(dy) {
        this.rules.push((b, p, x, y) =>
            (b.piece_map[[x, y + dy]] != undefined && b.pieces[b.piece_map[[x, y + dy]]].team == p.team)
         || (b.piece_map[[x, y - dy]] != undefined && b.pieces[b.piece_map[[x, y - dy]]].team == p.team)
        );
        return this;
    }

    non_teammate_at(x, y) {
        this.rules.push((b, p, _x, _y) => b.piece_map[[x, y]] != undefined && b.pieces[b.piece_map[[x, y]]].team != p.team);
        return this;
    }

    non_teammate_at_destination() {
        this.rules.push((b, p, x, y) => b.piece_map[[x, y]] != undefined && b.pieces[b.piece_map[[x, y]]].team != p.team);
        return this;
    }

    non_teammate_at_relative(dx, dy) {
        this.rules.push((b, p, x, y) => b.piece_map[[x, y]] != undefined && b.pieces[b.piece_map[[x + dx, y + dy]]].team != p.team);
        return this;
    }

    non_teammate_at_signed_dx(dx) {
        this.rules.push((b, p, x, y) => b.piece_map[[x + dx, y]] != undefined && b.pieces[b.piece_map[[x + dx, y]]].team != p.team);
        return this;
    }
    
    non_teammate_at_unsigned_dx(dx) {
        this.rules.push((b, p, x, y) =>
            (b.piece_map[[x + dx, y]] != undefined && b.pieces[b.piece_map[[x + dx, y]]].team != p.team)
         || (b.piece_map[[x - dx, y]] != undefined && b.pieces[b.piece_map[[x - dx, y]]].team != p.team)
        );
        return this;
    }

    non_teammate_at_signed_dy(dy) {
        this.rules.push((b, p, x, y) => b.piece_map[[x, y + dy]] != undefined && b.pieces[b.piece_map[[x, y + dy]]].team != p.team);
        return this;
    }
    
    non_teammate_at_unsigned_dy(dy) {
        this.rules.push((b, p, x, y) =>
            (b.piece_map[[x, y + dy]] != undefined && b.pieces[b.piece_map[[x, y + dy]]].team != p.team)
         || (b.piece_map[[x, y - dy]] != undefined && b.pieces[b.piece_map[[x, y - dy]]].team != p.team)
        );
        return this;
    }

    target_is(kind) {
        // since this is used before the board is built, the kind argument is actually
        // a PieceKindBuilder and we reference it by the index it will occupy, kind.idx
        this.rules.push((board, piece, x, y) => board.piece_map[[x,y]] != undefined && board.pieces[board.piece_map[[x,y]]].kind == kind.idx);
        return this;
    }

    custom(f) {
        this.rules.push(f);
        return this;
    }

    build() {
        return (board, piece, x, y) => this.rules.every(f => f(board, piece, x, y));
    }
}

class PieceKind {
    constructor(name, symbol, movesets, captures) {
        this.name = name;
        this.symbol = symbol;

        this.indirect_captures = captures.length > 0 ? captures[0].length == 2 : false;

        if (this.indirect_captures) {
            // indirect capture mode: captured pieces are not at destination of capturing piece
            if (captures.length == 0)
                // deep copy the moveset
                this.captures = movesets.map(x => {
                    let c = new MovesetBuilder;
                    c.rules = [...x.rules];
                    return [
                        c.nobody_at_destination().build(),
                        (new MovesetBuilder).non_teammate_at_destination().build() // captured piece at destination tile
                    ];
                });
            else
                this.captures = captures.map(x => [
                    x[0].nobody_at_destination().build(),
                    x[1].non_teammate_at_destination().build()
                ]);

        } else {
            // direct capture mode: captured piece is at destination of capturing piece
            if (captures.length == 0)
                // deep copy the moveset
                this.captures = movesets.map(x => {
                    let c = new MovesetBuilder;
                    c.rules = [...x.rules];
                    return c.non_teammate_at_destination().build();
                });
            else
                this.captures = captures.map(x => x.non_teammate_at_destination().build());
        }

        this.movesets = movesets.map(x => x.nobody_at_destination().build());
    }
}

class PieceKindBuilder {
    constructor(idx) {
        this.idx = idx;
        this._name = null;
        this._symbol = null;
        this.movesets = [];
        this.captures = [];
        this._indirect_captures = null;
    }

    name(n) {
        if (this._name !== null)
            throw Error('Cannot double assign piece name.');
        this._name = n;
        return this;
    }

    symbol(x) {
        if (this._symbol !== null)
            throw Error('Cannot double assign piece symbol.');
        this._symbol = x;
        return this;
    }

    has_moveset(f) {
        let moveset = f(new MovesetBuilder);
        this.movesets.push(moveset);
        return this;
    }

    indirect_captures() {
        // direct capture mode: captured piece is at destination of capturing piece
        // indirect capture mode: captured pieces are not at destination of capturing piece
        //                        captures must specify the location of both destination and captured piece
        if (this._indirect_captures != null)
            throw Error('You must set indirect capture mode before creating any captures.')
        this._indirect_captures = true;
        return this;
    }

    has_captures(f) {
        if (this._indirect_captures == false || this._indirect_captures == null) {
            this._indirect_captures = false;

            let capture = f(new MovesetBuilder);
            this.captures.push(capture);
        } else if (this._indirect_captures == true) {
            // destination represents the destination tile relative to the origin tile of the capturing piece
            // capture represents the position of the captured piece relative to the destination tile
            let [destination, capture] = f(new MovesetBuilder, new MovesetBuilder);
            this.captures.push([destination, capture]);
        }
        return this;
    }

    build() {
        return new PieceKind(this._name, this._symbol, this.movesets, this.captures);
    }
}

class Piece {
    constructor(kind, team, x, y) {
        this.kind = kind;
        this.team = team;
        this.alive = true;
        this.x = x;
        this.y = y;
    }
}

class PieceBuilder {
    constructor() {
        this.kind = null;
        this.team = null;
        this.x = null;
        this.y = null;
    }

    is(k) {
        if (this.kind !== null)
            throw Error('Cannot double assign piece kind.');
        this.kind = k.idx;
        return this;
    }

    on_team(team) {
        if (this.team !== null)
            throw Error('Cannot double assign piece team.');
        this.team = team;
        return this;
    }

    x(n) {
        if (this.x !== null)
            throw Error('Cannot double assign piece x-position.');
        this.x = n;
        return this;
    }

    y(n) {
        if (this.y !== null)
            throw Error('Cannot double assign piece y-position.');
        this.y = n;
        return this;
    }

    at(x, y) {
        if (this.x !== null || this.y !== null)
            throw Error('Cannot double assign piece position.');
        this.x = x;
        this.y = y;
        return this;
    }

    build() {
        return new Piece(this.kind, this.team, this.x, this.y);
    }
}