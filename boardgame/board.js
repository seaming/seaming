const PiecePositionModes = Object.freeze({ "cell": 1, "vertex": 2 });

const DEFAULT_LINE_STYLE = { color: '#333333', width: 2, linecap: 'square' };
const DEFAULT_TEXT_STYLE = { size: 20, family: 'Arial' };

class Board {
    constructor(draw, width, height, piece_position, styling, breaks) {
        this._draw = draw;
        this.width = width;
        this.height = height;
        this.piece_position = piece_position;
        this.breaks = breaks;

        this.all_tiles = Object.freeze(range(1, this.width).flatMap(x => range(1, this.height).map(y => [x, y])));

        this.styling = styling;
        this.styling.line_style = { ...DEFAULT_LINE_STYLE, ...this.styling.line_style };
        this.styling.text_style = { ...DEFAULT_TEXT_STYLE, ...this.styling.text_style };

        this.teams = [];
        this.active_team = undefined;

        this.piece_kinds = [];
        this.pieces = [];
        this.piece_map = {};
        this.all_tiles.forEach(idx => this.piece_map[idx] = undefined);

        this.movement_dots = {};
        this.all_tiles.forEach(idx => this.movement_dots[idx] = undefined);

        this.capture_dots = {};
        this.all_tiles.forEach(idx => this.capture_dots[idx] = undefined);

        this.active = false;
        this.paused = false;

        // board drawing constants
        if (this.piece_position === PiecePositionModes.cell) {

            this.cs = Math.min(
                (WINDOW_SIZE - this.styling.line_style.width) / (this.width + this.breaks.file.length / 2),
                (WINDOW_SIZE - this.styling.line_style.width) / (this.height + this.breaks.rank.length / 2)
            );

            this.x_start = (WINDOW_SIZE - this.cs * (this.width + this.breaks.file.length / 2)) / 2;
            this.y_start = (WINDOW_SIZE - this.cs * (this.height + this.breaks.rank.length / 2)) / 2;

        } else if (this.piece_position === PiecePositionModes.vertex) {

            this.cs = Math.min(
                (WINDOW_SIZE - this.styling.line_style.width) / this.width,
                (WINDOW_SIZE - this.styling.line_style.width) / this.height
            );

            this.x_start = (WINDOW_SIZE - this.cs * this.width) / 2;
            this.y_start = (WINDOW_SIZE - this.cs * this.height) / 2;

        }

        this.piece_diameter = 5 / 6 * this.cs;

    }

    build() {
        if (this.active)
            throw Error('Cannot rebuild an active game.');

        this.active = true;
        this.piece_kinds = this.piece_kinds.map(x => x.build());
    }

    team(f) {
        if (this.active)
            throw Error('Cannot edit properties of an active game.');

        let team = f(new TeamBuilder).build();
        this.teams.push(team);
        if (this.active_team == undefined)
            this.active_team = this.teams.length - 1;
        return this.teams.length - 1;
    }

    piece_kind() {
        if (this.active)
            throw Error('Cannot edit properties of an active game.');

        let pkind = new PieceKindBuilder(this.piece_kinds.length);
        this.piece_kinds.push(pkind);
        return pkind;
    }

    add_piece(f) {
        if (this.active)
            throw Error('Cannot edit properties of an active game.');

        let p = f(new PieceBuilder).build();
        this.pieces.push(p);
        this.piece_map[[p.x, p.y]] = this.pieces.length - 1;
    }

    draw() {
        if (!this.active)
            this.build();

        this._draw.clear();
        this.draw_board();
        this.draw_pieces();
    }

    draw_board() {

        let grid_dots = (i, j, x, y) => {
            this.movement_dots[[i, j]] =
                this._draw.circle(this.piece_diameter / 2)
                    .center(x, y)
                    .fill('#0000ff')
                    .opacity(0.2)
                    .hide();

            this.capture_dots[[i, j]] =
                this._draw.circle(this.piece_diameter * 21 / 20)
                    .center(x, y)
                    .stroke({ width: 5, color: '#ff0000' })
                    .fill({ opacity: 0 })
                    .opacity(0.2)
                    .hide();
        }

        if (this.piece_position === PiecePositionModes.cell) {

            if (this.styling.background_color !== null)
                this._draw.rect((this.width + this.breaks.file.length / 2) * this.cs, (this.height + this.breaks.rank.length / 2) * this.cs)
                    .move(this.x_start, this.y_start)
                    .fill(this.styling.background_color);

            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    let _x = this.x_start + x * this.cs + this.breaks.file.filter(n => n < x + 1).length * this.cs / 2;
                    let _y = this.y_start + y * this.cs + this.breaks.rank.filter(n => n < y + 1).length * this.cs / 2;

                    if (this.styling.odd_checkerboard !== false)
                        if ((x + y) % 2 != 0)
                            this._draw.rect(this.cs, this.cs).move(_x, _y).fill(this.styling.odd_checkerboard);

                    if (this.styling.even_checkerboard !== false)
                        if ((x + y) % 2 == 0)
                            this._draw.rect(this.cs, this.cs).move(_x, _y).fill(this.styling.even_checkerboard);

                    if (this.styling.draw_tile_edges) {
                        this._draw.line(_x, _y, _x + this.cs, _y).stroke(this.styling.line_style);

                        if (y == this.height - 1)
                            this._draw.line(_x, _y + this.cs, _x + this.cs, _y + this.cs).stroke(this.styling.line_style);

                        if (this.breaks.file.includes(x + 1))
                            this._draw.line(_x + this.cs, _y, _x + this.cs, _y + this.cs).stroke(this.styling.line_style);

                        this._draw.line(_x, _y, _x, _y + this.cs).stroke(this.styling.line_style);

                        if (x == this.width - 1)
                            this._draw.line(_x + this.cs, _y, _x + this.cs, _y + this.cs).stroke(this.styling.line_style);

                        if (this.breaks.rank.includes(y + 1))
                            this._draw.line(_x, _y + this.cs, _x + this.cs, _y + this.cs).stroke(this.styling.line_style);
                    }

                    grid_dots(x + 1, y + 1, _x + this.cs / 2, _y + this.cs / 2)
                }
            }

            this.styling.crosses.forEach(cross => {
                let [p1, p2] = cross;
                let [x1, y1] = p1;
                let [x2, y2] = p2;
                [x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)];
                [y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)];

                x1 = (x1 - 1.5) * this.cs + this.x_start + this.cs / 2;
                y1 = (y1 - 1.5) * this.cs + this.y_start + this.cs / 2;
                x2 = (x2 - 0.5) * this.cs + this.x_start + this.cs / 2;
                y2 = (y2 - 0.5) * this.cs + this.y_start + this.cs / 2;

                let mask = this._draw.mask();
                mask.add(this._draw.rect(Math.abs(x2 - x1), Math.abs(y2 - y1)).move(x1, y1).fill('#fff'));

                this._draw.line(x1, y1, x2, y2).stroke(this.styling.line_style).maskWith(mask);
                this._draw.line(x1, y2, x2, y1).stroke(this.styling.line_style).maskWith(mask);
            });

        } else if (this.piece_position === PiecePositionModes.vertex) {

            if (this.styling.background_color !== null)
                this._draw.rect((this.width + this.breaks.file.length / 2 - 1) * this.cs, (this.height + this.breaks.rank.length / 2 - 1) * this.cs)
                    .move(this.x_start + this.cs / 2, this.y_start + this.cs / 2)
                    .fill(this.styling.background_color);

            for (let y = 0; y < this.height - 1; y++) {
                for (let x = 0; x < this.width - 1; x++) {
                    let _x = x * this.cs + this.x_start + this.cs / 2;
                    let _y = y * this.cs + this.y_start + this.cs / 2;

                    if (this.styling.odd_checkerboard !== false)
                        if ((x + y) % 2 != 0 && !this.breaks.file.includes(x + 1) && !this.breaks.rank.includes(y + 1))
                            this._draw.rect(this.cs, this.cs).move(_x, _y).fill(this.styling.odd_checkerboard);

                    if (this.styling.even_checkerboard !== false)
                        if ((x + y) % 2 == 0 && !this.breaks.file.includes(x + 1) && !this.breaks.rank.includes(y + 1))
                            this._draw.rect(this.cs, this.cs).move(_x, _y).fill(this.styling.even_checkerboard);

                    if (this.styling.draw_tile_edges) {
                        if (!this.breaks.file.includes(x + 1)) {
                            this._draw.line(_x, _y, _x + this.cs, _y).stroke(this.styling.line_style);
                            if (y == this.height - 2)
                                this._draw.line(_x, _y + this.cs, _x + this.cs, _y + this.cs).stroke(this.styling.line_style);
                        }

                        if (!this.breaks.rank.includes(y + 1)) {
                            this._draw.line(_x, _y, _x, _y + this.cs).stroke(this.styling.line_style);
                            if (x == this.width - 2)
                                this._draw.line(_x + this.cs, _y, _x + this.cs, _y + this.cs).stroke(this.styling.line_style);
                        }
                    }

                    grid_dots(x + 1, y + 1, _x, _y)
                    if (y == this.height - 2)
                        grid_dots(x + 1, y + 2, _x, _y + this.cs);
                    if (x == this.width - 2)
                        grid_dots(x + 2, y + 1, _x + this.cs, _y);
                    if (x == this.width - 2 && y == this.height - 2)
                        grid_dots(x + 2, y + 2, _x + this.cs, _y + this.cs);
                }
            }

            this.styling.crosses.forEach(cross => {
                let [p1, p2] = cross;
                let [x1, y1] = p1;
                let [x2, y2] = p2;

                if (x1 == x2 || y1 == y2)
                    return;

                x1 = (x1 - 1) * this.cs + this.x_start + this.cs / 2;
                y1 = (y1 - 1) * this.cs + this.y_start + this.cs / 2;
                x2 = (x2 - 1) * this.cs + this.x_start + this.cs / 2;
                y2 = (y2 - 1) * this.cs + this.y_start + this.cs / 2;

                let mask = this._draw.mask();
                mask.add(this._draw.rect(Math.abs(x2 - x1), Math.abs(y2 - y1)).move(x1, y1).fill('#fff'));

                this._draw.line(x1, y1, x2, y2).stroke(this.styling.line_style).maskWith(mask);
                this._draw.line(x1, y2, x2, y1).stroke(this.styling.line_style).maskWith(mask);
            });
        }
    }

    draw_pieces() {
        for (let piece of this.pieces) {
            if (!piece.alive)
                continue;

            let g = this._draw.group().addClass('piece');
            if (piece.team == this.active_team)
                g.addClass('active');

            if (this.piece_position === PiecePositionModes.cell) {

                // const this.piece_diameter = 5 / 6 * this.cs;

                let x = this.x_start + (piece.x - 1) * this.cs + (this.breaks.file.filter(n => n < piece.x).length + 1) * this.cs / 2;
                let y = this.y_start + (piece.y - 1) * this.cs + (this.breaks.rank.filter(n => n < piece.y).length + 1) * this.cs / 2;

                // g.circle(this.piece_diameter).center(x, y).fill('white').stroke(this.styling.line_style);
                g.text(this.piece_kinds[piece.kind].symbol)
                    .font(this.styling.text_style)
                    .fill(this.teams[piece.team].color)
                    .center(x, y);

            } else if (this.piece_position === PiecePositionModes.vertex) {

                let x = this.x_start + (piece.x - 1) * this.cs + this.cs / 2;
                let y = this.y_start + (piece.y - 1) * this.cs + this.cs / 2;

                g.circle(this.piece_diameter).center(x, y).fill('white').stroke(this.styling.line_style);
                g.text(this.piece_kinds[piece.kind].symbol)
                    .font(this.styling.text_style)
                    .fill(this.teams[piece.team].color)
                    .center(x, y);
            }

            let pkind = this.piece_kinds[piece.kind];

            g.on('mousedown', () => {
                if (this.paused)
                    return;

                if (piece.team != this.active_team)
                    return;

                g.moving = true;
                g.front();

                this.all_tiles.forEach(idx => {
                    if (pkind.movesets.some(f => f(this, piece, ...idx)))
                        this.movement_dots[idx].show();

                    if (!pkind.indirect_captures) {
                        if (pkind.captures.some(f => f(this, piece, ...idx)))
                            this.capture_dots[idx].show();

                    } else {
                        this.find_indirect_captures(piece, ...idx).forEach(jdx => {
                            this.movement_dots[idx].show();
                            this.capture_dots[jdx].show();
                        });
                    }

                });
                this.movement_dots[[piece.x, piece.y]].hide();

                this._draw.on('mousemove', (event) => {
                    if (this.paused)
                        return;

                    let mouse = mouse_pos(event);
                    g.center(mouse.x, mouse.y);
                });
            });

            this._draw.on(['mouseup', 'mouseleave'], (event) => {
                if (g.moving === true) {
                    this._draw.off('mousemove')
                    g.moving = false;

                    let mouse = mouse_pos(event);
                    let [grid_x, grid_y] = this.screen_to_board(mouse.x, mouse.y);

                    // destination is within the board bounds
                    if (grid_x >= 1 || grid_x <= this.width || grid_y >= 1 || grid_y <= this.height) {

                        let window_x = this.x_start + (piece.x - 1) * this.cs + this.cs / 2;
                        let window_y = this.y_start + (piece.y - 1) * this.cs + this.cs / 2;
                        let sq_dst = (g.x - window_x) * (g.x - window_x) + (g.y - window_y) * (g.y - window_y);

                        // player is holding piece close enough to the destination to snap
                        if (!(sq_dst > 1 / 16 * this.piece_diameter * this.piece_diameter)) {

                            let indirect_captures = null;
                            if (pkind.indirect_captures)
                                indirect_captures = this.find_indirect_captures(piece, grid_x, grid_y);

                            // resolve captures first since some captures are also valid moves and resolving
                            // moves first would move without capturing
                            if (!pkind.indirect_captures && pkind.captures.some(f => f(this, piece, grid_x, grid_y))) {
                                this.capture_tile(piece, grid_x, grid_y);
                                this.move_to(piece, grid_x, grid_y);
                            }

                            else if (indirect_captures != null && indirect_captures.length != 0) {
                                indirect_captures.forEach(idx => this.capture_tile(piece, ...idx));
                                this.move_to(piece, grid_x, grid_y);
                            }

                            // if the piece has a moveset that allows it to reach the destination
                            else if (pkind.movesets.some(f => f(this, piece, grid_x, grid_y)))
                                this.move_to(piece, grid_x, grid_y);

                            else
                                this.draw();
                        }
                    }
                }
            });
        }
    }

    move_to(moving, x, y) {
        if (this.piece_map[[x, y]] != undefined)
            throw Error('Cannot move to an occupied tile.')

        this.paused = true;

        let idx = this.piece_map[[moving.x, moving.y]];
        this.piece_map[[moving.x, moving.y]] = undefined;
        this.piece_map[[x, y]] = idx;

        moving.x = x;
        moving.y = y;

        for (let promotion of this.piece_kinds[moving.kind].promotions) {
            let kinds = promotion[0];
            let f = promotion[1];

            if (f(this, moving, x, y)) {
                this.offer_promotion(moving, kinds);
                return;
            }        
        }

        this.finish_turn();
    }

    finish_turn() {
        this.next_team();
        this.draw();
        this.paused = false;
    }

    offer_promotion(piece, kinds) {
        const PAD = 10;

        let box = this._draw.rect(kinds.length * (this.piece_diameter + PAD) + PAD, this.piece_diameter + 2 *  PAD)
            .center(WINDOW_SIZE / 2, WINDOW_SIZE / 2)
            .fill(this.styling.background_color != null ? this.styling.background_color : 'none').opacity(0.6)
            .stroke(this.styling.line_style).radius(10);

        let options = [];
        for (let [i, kind] of kinds.entries()) {
            let option = this._draw.text(this.piece_kinds[kind].symbol)
                .addClass('promote-select')
                .font(this.styling.text_style)
                .fill(this.teams[piece.team].color)
                .center(WINDOW_SIZE / 2, WINDOW_SIZE / 2)
                .dx((i - kinds.length / 2 + 0.5) * (this.piece_diameter + PAD));

            options.push(option);

            option.on('mouseover', () => option.scale(1.5));
            option.on('mouseout', () => option.scale(1 / 1.5));
            option.on('click', () => {
                box.remove();
                options.forEach(x => x.remove());
                piece.kind = kind;
                this.finish_turn();
            });
        }
    }

    find_indirect_captures(piece, x, y) {
        let captures = [];

        this.piece_kinds[piece.kind].captures.forEach(f => {
            let [dest, cap] = f;
            if (dest(this, piece, x, y)) {
                // when calculating the viability of a tile to capture, we pretend
                // the capturing piece doesnt exist so it cant e.g. partner with
                // itself to capture a tile
                let idx = this.piece_map[[piece.x, piece.y]];
                this.piece_map[[piece.x, piece.y]] = undefined;

                let mock_piece = new Piece(piece.kind, piece.team, x, y);
                this.all_tiles.forEach(jdx => {
                    if (cap(this, mock_piece, ...jdx))
                        captures.push(jdx);
                });

                // put it back
                this.piece_map[[piece.x, piece.y]] = idx;
            }
        });

        return captures;
    }

    capture_tile(capturing, x, y) {
        let captured = this.piece_map[[x, y]];
        if (captured != undefined)
            if (this.pieces[captured] != capturing) {
                this.pieces[captured].alive = false;
                this.piece_map[[x, y]] = undefined;
            }
    }

    next_team() {
        this.active_team = (this.active_team + 1) % this.teams.length;
    }

    screen_to_board(screen_x, screen_y) {
        let grid_x = Math.round((screen_x - this.x_start - this.cs / 2) / this.cs) + 1;
        let grid_y = Math.round((screen_y - this.y_start - this.cs / 2) / this.cs) + 1;
        return [grid_x, grid_y];
    }
}

class BoardBuilder {
    constructor(draw) {
        this.draw = draw;
        this.board_width = null;
        this.board_height = null;
        this.styling = {
            background_color: null,
            draw_tile_edges: null,
            odd_checkerboard: null,
            even_checkerboard: null,
            line_style: null,
            text_style: null,
            crosses: [],
        };
        this.piece_position = null;
        this.rank_breaks = [];
        this.file_breaks = [];
    }

    width(n) {
        if (this.board_width !== null)
            throw Error('Cannot double assign board width.');
        this.board_width = n;
        return this;
    }

    height(n) {
        if (this.board_height !== null)
            throw Error('Cannot double assign board height.');
        this.board_height = n;
        return this;
    }

    size(w, h) {
        if (this.board_width !== null || this.board_height !== null)
            throw Error('Cannot double assign board width or height.');
        this.board_width = w;
        this.board_height = h;
        return this;
    }

    background(color) {
        if (this.styling.background_color !== null)
            throw Error('Cannot double assign board color.');
        this.styling.background_color = color;
        return this;
    }

    no_tile_edges() {
        if (this.styling.draw_tile_edges !== null)
            throw Error('Cannot double assign board edge style.');
        this.styling.draw_tile_edges = false;
        return this;
    }

    odd_checkerboard(value) {
        if (this.styling.odd_checkerboard !== null)
            throw Error('Cannot double assign board checkering style.');
        this.styling.odd_checkerboard = value;
        return this;
    }

    even_checkerboard(value) {
        if (this.styling.even_checkerboard !== null)
            throw Error('Cannot double assign board checkering style.');
        this.styling.even_checkerboard = value;
        return this;
    }

    cross(p1, p2) {
        this.styling.crosses.push([p1, p2]);
        return this;
    }

    line_style(style) {
        if (this.styling.line_style !== null)
            throw Error('Cannot double assign board line style.');
        this.styling.line_style = style;
        return this;
    }

    text_style(style) {
        if (this.styling.text_style !== null)
            throw Error('Cannot double assign board text style.');
        this.styling.text_style = style;
        return this;
    }

    piece_in_square() {
        if (this.piece_position !== null)
            throw Error('Cannot double assign piece position mode.');
        this.piece_position = PiecePositionModes.cell;
        return this;
    }

    piece_on_vertex() {
        if (this.piece_position !== null)
            throw Error('Cannot double assign piece position mode.');
        this.piece_position = PiecePositionModes.vertex;
        return this;
    }

    break_after_file(n) {
        this.file_breaks.push(n);
        return this;
    }

    break_after_rank(n) {
        this.rank_breaks.push(n);
        return this;
    }

    build() {
        if (this.board_width === null)
            throw Error('You must assign a board width');

        if (this.board_height === null)
            throw Error('You must assign a board height');

        if (this.piece_position === null)
            throw Error('You must assign a piece position mode');

        if (this.styling.draw_tile_edges === null)
            this.styling.draw_tile_edges = true;

        if (this.styling.odd_checkerboard === null)
            this.styling.odd_checkerboard = false;

        if (this.styling.even_checkerboard === null)
            this.styling.even_checkerboard = false;

        if (this.styling.line_style === null)
            this.styling.line_style = {};

        if (this.styling.text_style === null)
            this.styling.text_style = {};

        return new Board(
            this.draw,
            this.board_width,
            this.board_height,
            this.piece_position,
            this.styling,
            { rank: this.rank_breaks, file: this.file_breaks },
        );
    }
}