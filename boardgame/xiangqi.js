function xiangqi(draw) {
    let board = new BoardBuilder(draw)
        .size(9, 10)
        .piece_on_vertex()
        .cross([4,1], [6,3])
        .cross([4,8], [6,10])
        .break_after_rank(5)
        .build();


    let red = board.team(t => t.name('red').color('#cc0000'));
    let black = board.team(t => t.name('black').color('black'));


    let black_general = board.piece_kind().name('General').symbol('将')
        .has_moveset(m => m
            .orthogonal()
            .max_manhattan_distance(1)
            .x_constraint(x => 4 <= x && x <= 6)
            .y_constraint(y => 1 <= y && y <= 3));

    let red_general = board.piece_kind().name('General').symbol('帅')
        .has_moveset(m => m
            .orthogonal()
            .max_manhattan_distance(1)
            .x_constraint(x => 4 <= x && x <= 6)
            .y_constraint(y => 8 <= y && y <= 10));

    let black_guard = board.piece_kind().name('Guard').symbol('士')
        .has_moveset(m => m
            .diagonal()
            .max_manhattan_distance(2)
            .x_constraint(x => 4 <= x && x <= 6)
            .y_constraint(y => 1 <= y && y <= 3));

    let red_guard = board.piece_kind().name('Guard').symbol('士')
        .has_moveset(m => m
            .diagonal()
            .max_manhattan_distance(2)
            .x_constraint(x => 4 <= x && x <= 6)
            .y_constraint(y => 8 <= y && y <= 10));

    let black_elephant = board.piece_kind().name('Elephant').symbol('象')
        .has_moveset(m => m
            .unsigned_xy_delta(2, 2)
            .clear_diagonal()
            .y_constraint(y => y <= 5));

    let red_elephant = board.piece_kind().name('Elephant').symbol('相')
        .has_moveset(m => m
            .unsigned_xy_delta(2, 2)
            .clear_diagonal()
            .y_constraint(y => 5 <= y));

    let horse = board.piece_kind().name('Horse').symbol('马')
        .has_moveset(m => m.signed_x_delta(2).unsigned_y_delta(1).clear_relative_tile(1, 0))
        .has_moveset(m => m.signed_x_delta(-2).unsigned_y_delta(1).clear_relative_tile(-1, 0))
        .has_moveset(m => m.signed_y_delta(2).unsigned_x_delta(1).clear_relative_tile(0, 1))
        .has_moveset(m => m.signed_y_delta(-2).unsigned_x_delta(1).clear_relative_tile(0, -1));

    let chariot = board.piece_kind().name('Chariot').symbol('车')
        .has_moveset(m => m.clear_orthogonal());

    let black_cannon = board.piece_kind().name('Cannon').symbol('砲')
        .has_moveset(m => m.clear_orthogonal())
        .has_captures(c => c.orthogonal().custom((b, p, x, y) => {
            if (p.x == x) {
                return range(y, p.y).slice(1, -1).filter(n => b.piece_map[[x, n]] != null).length == 1;
            } else if (p.y == y) {
                return range(x, p.x).slice(1, -1).filter(n => b.piece_map[[n, y]] != null).length == 1;
            }
            return false;
        }));

    let red_cannon = board.piece_kind().name('Cannon').symbol('炮')
        .has_moveset(m => m.clear_orthogonal())
        .has_captures(c => c.orthogonal().custom((b, p, x, y) => {
            if (p.x == x) {
                return range(y, p.y).slice(1, -1).filter(n => b.piece_map[[x, n]] != null).length == 1;
            } else if (p.y == y) {
                return range(x, p.x).slice(1, -1).filter(n => b.piece_map[[n, y]] != null).length == 1;
            }
            return false;
        }));

    let black_soldier = board.piece_kind().name('Soldier').symbol('卒')
        .has_moveset(m => m.signed_xy_delta(0, 1))
        .has_moveset(m => m.y_condition(y => y > 5).unsigned_x_delta(1).fix_y());

    let red_soldier = board.piece_kind().name('Soldier').symbol('兵')
        .has_moveset(m => m.signed_xy_delta(0, -1))
        .has_moveset(m => m.y_condition(y => y <= 5).unsigned_x_delta(1).fix_y());


    board.add_piece(p => p.is(black_general).on_team(black).at(5, 1));

    board.add_piece(p => p.is(black_guard).on_team(black).at(4, 1));
    board.add_piece(p => p.is(black_guard).on_team(black).at(6, 1));

    board.add_piece(p => p.is(black_elephant).on_team(black).at(3, 1));
    board.add_piece(p => p.is(black_elephant).on_team(black).at(7, 1));

    board.add_piece(p => p.is(horse).on_team(black).at(2, 1));
    board.add_piece(p => p.is(horse).on_team(black).at(8, 1));

    board.add_piece(p => p.is(chariot).on_team(black).at(1, 1));
    board.add_piece(p => p.is(chariot).on_team(black).at(9, 1));

    board.add_piece(p => p.is(black_cannon).on_team(black).at(2, 3));
    board.add_piece(p => p.is(black_cannon).on_team(black).at(8, 3));

    board.add_piece(p => p.is(black_soldier).on_team(black).at(1, 4));
    board.add_piece(p => p.is(black_soldier).on_team(black).at(3, 4));
    board.add_piece(p => p.is(black_soldier).on_team(black).at(5, 4));
    board.add_piece(p => p.is(black_soldier).on_team(black).at(7, 4));
    board.add_piece(p => p.is(black_soldier).on_team(black).at(9, 4));


    board.add_piece(p => p.is(red_general).on_team(red).at(5, 10));

    board.add_piece(p => p.is(red_guard).on_team(red).at(4, 10));
    board.add_piece(p => p.is(red_guard).on_team(red).at(6, 10));

    board.add_piece(p => p.is(red_elephant).on_team(red).at(3, 10));
    board.add_piece(p => p.is(red_elephant).on_team(red).at(7, 10));

    board.add_piece(p => p.is(horse).on_team(red).at(2, 10));
    board.add_piece(p => p.is(horse).on_team(red).at(8, 10));

    board.add_piece(p => p.is(chariot).on_team(red).at(1, 10));
    board.add_piece(p => p.is(chariot).on_team(red).at(9, 10));

    board.add_piece(p => p.is(red_cannon).on_team(red).at(2, 8));
    board.add_piece(p => p.is(red_cannon).on_team(red).at(8, 8));

    board.add_piece(p => p.is(red_soldier).on_team(red).at(1, 7));
    board.add_piece(p => p.is(red_soldier).on_team(red).at(3, 7));
    board.add_piece(p => p.is(red_soldier).on_team(red).at(5, 7));
    board.add_piece(p => p.is(red_soldier).on_team(red).at(7, 7));
    board.add_piece(p => p.is(red_soldier).on_team(red).at(9, 7));

    return board;
}