function chess(draw) {
    let board = new BoardBuilder(draw)
        .size(8, 8)
        .piece_in_square()
        .odd_checkerboard('#f7cfa4')
        .even_checkerboard('#c78d53')
        .no_tile_edges()
        .text_style({ size: '40pt' })
        .build();


    let white = board.team(t => t.name('white').color('white'));
    let black = board.team(t => t.name('black').color('black'));

    let king = board.piece_kind().name('King').symbol('♚')
        .has_moveset(m => m.max_diagonal_distance(1));

    let queen = board.piece_kind().name('Queen').symbol('♛')
        .has_moveset(m => m.clear_orthogonal())
        .has_moveset(m => m.diagonal().clear_diagonal());

    let rook = board.piece_kind().name('Rook').symbol('♜')
        .has_moveset(m => m.clear_orthogonal());

    let bishop = board.piece_kind().name('Bishop').symbol('♝')
        .has_moveset(m => m.diagonal().clear_diagonal());

    let knight = board.piece_kind().name('Knight').symbol('♞')
        .has_moveset(m => m.unsigned_xy_delta(1,2))
        .has_moveset(m => m.unsigned_xy_delta(2,1));

    let black_pawn = board.piece_kind().name('Pawn').symbol('♟')
        .has_moveset(m => m.signed_y_delta(1).fix_x())
        .has_moveset(m => m.y_condition(y => y == 2).signed_y_delta(2).fix_x())
        .has_captures(c => c.signed_y_delta(1).unsigned_x_delta(1));

    let white_pawn = board.piece_kind().name('Pawn').symbol('♟')
        .has_moveset(m => m.signed_y_delta(-1).fix_x())
        .has_moveset(m => m.y_condition(y => y == 7).signed_y_delta(-2).fix_x())
        .has_captures(c => c.signed_y_delta(-1).unsigned_x_delta(1));

    board.add_piece(p => p.is(king).on_team(black).at(5, 1));
    board.add_piece(p => p.is(queen).on_team(black).at(4, 1));
    board.add_piece(p => p.is(rook).on_team(black).at(1, 1));
    board.add_piece(p => p.is(rook).on_team(black).at(8, 1));
    board.add_piece(p => p.is(bishop).on_team(black).at(3, 1));
    board.add_piece(p => p.is(bishop).on_team(black).at(6, 1));
    board.add_piece(p => p.is(knight).on_team(black).at(2, 1));
    board.add_piece(p => p.is(knight).on_team(black).at(7, 1));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(1, 2));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(2, 2));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(3, 2));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(4, 2));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(5, 2));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(6, 2));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(7, 2));
    board.add_piece(p => p.is(black_pawn).on_team(black).at(8, 2));

    board.add_piece(p => p.is(king).on_team(white).at(5, 8));
    board.add_piece(p => p.is(queen).on_team(white).at(4, 8));
    board.add_piece(p => p.is(rook).on_team(white).at(1, 8));
    board.add_piece(p => p.is(rook).on_team(white).at(8, 8));
    board.add_piece(p => p.is(bishop).on_team(white).at(3, 8));
    board.add_piece(p => p.is(bishop).on_team(white).at(6, 8));
    board.add_piece(p => p.is(knight).on_team(white).at(2, 8));
    board.add_piece(p => p.is(knight).on_team(white).at(7, 8));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(1, 7));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(2, 7));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(3, 7));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(4, 7));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(5, 7));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(6, 7));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(7, 7));
    board.add_piece(p => p.is(white_pawn).on_team(white).at(8, 7));

    return board;
}