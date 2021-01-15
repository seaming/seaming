function tablut(draw) {
    let board = new BoardBuilder(draw)
        .size(9, 9)
        .piece_in_square()
        .odd_checkerboard('#f7cfa4')
        .even_checkerboard('#c78d53')
        .cross([5,5], [5,5])
        .line_style({ color: '#f7cfa4', width: 5 })
        .no_tile_edges()
        .text_style({ size: '40pt' })
        .build();

    let white = board.team(t => t.name('Swedes').color('white'));
    let black = board.team(t => t.name('Muscovites').color('black'));

    let king = board.piece_kind().name('King').symbol('♚');
    let pawn = board.piece_kind().name('Pawn').symbol('♟');

    let not_55 = (x, y) => x != 5 || y != 5;
    let castle_adjacent_positions = (x, y) => (x == 5 && (y == 4 || y == 6)) || (y == 5 && (x == 4 || x == 6));
    let castle_capture_positions = (x, y) => (x == 5 && (y == 3 || y == 7)) || (y == 5 && (x == 3 || x == 7));

    // function for the basic moves/captures of all pieces
    let moveset_f = x => x
        // moves along a clear horizontal or vertical line but cannot land in the (5,5) square
        .has_moveset(m => m.clear_orthogonal().xy_constraint(not_55))
        .indirect_captures()
        .has_captures((dst, cap) => [
            // capturing piece moves along a rank without landing in the (5,5) square
            dst.fix_y().clear_orthogonal().xy_constraint(not_55),
            // to capture a pawn 1 tile away on the same file as the destination where there
            // is a teammate on the same file on the other side of the captured pawn
            cap.target_is(pawn).fix_x().max_manhattan_distance(1).teammate_at_unsigned_dy(1)
        ])
        .has_captures((dst, cap) => [
            // capturing piece moves a long a rank without landing in the (5,5) square
            dst.fix_y().clear_orthogonal().xy_constraint(not_55),
            // to capture a pawn 1 tile away on the same rank as the destination where there
            // is a teammate on the same rank on the other side of the captured pawn
            cap.target_is(pawn).fix_y().max_manhattan_distance(1).teammate_at_unsigned_dx(1)
        ])
        .has_captures((dst, cap) => [
            // capturing piece moves along a file without landing in the (5,5) square
            dst.fix_x().clear_orthogonal().xy_constraint(not_55),
            // to capture a pawn 1 tile away on the same rank as the destination where there
            // is a teammate on the same rank on the other side of the captured pawn
            cap.target_is(pawn).fix_y().max_manhattan_distance(1).teammate_at_unsigned_dx(1)
        ])
        .has_captures((dst, cap) => [
            // capturing piece moves along a file without landing in the (5,5) square
            dst.fix_x().clear_orthogonal().xy_constraint(not_55),
            // to capture a pawn 1 tile away on the same file as the destination where there
            // is a teammate on the same file on the other side of the captured pawn
            cap.target_is(pawn).fix_x().max_manhattan_distance(1).teammate_at_unsigned_dy(1)
        ])
        .has_captures((dst, cap) => [
            // capturing piece moves legally to reach a castle capturing position
            dst.clear_orthogonal().xy_constraint(castle_capture_positions),
            // to capture a pawn adjacent to the unoccupied castle
            cap.target_is(pawn).max_manhattan_distance(1).xy_constraint(castle_adjacent_positions).nobody_at(5, 5)
        ])
        .has_captures((dst, cap) => [
            // capturing piece moves legally to reach a castle capturing position
            dst.clear_orthogonal().xy_constraint(castle_capture_positions),
            // to capture a pawn adjacent to the castle when occupied by the opposing king
            cap.target_is(pawn).max_manhattan_distance(1).xy_constraint(castle_adjacent_positions).non_teammate_at(5, 5)
        ]);

    king = moveset_f(king);
    pawn = moveset_f(pawn);

    // the pawn has additional captures for the king
    // since theres only one king, the king doesnt need these captures

    pawn.has_captures((dst, cap) => [
            // same as pawn captures above, only the king cannot be in or adjacent to the castle
            dst.fix_y().clear_orthogonal().xy_constraint(not_55),
            cap.target_is(king).xy_constraint(not_55).xy_constraint((x,y) => !castle_adjacent_positions(x,y))
                .fix_x().max_manhattan_distance(1).teammate_at_unsigned_dy(1)
        ])
        .has_captures((dst, cap) => [
            // same as pawn captures above, only the king cannot be in or adjacent to the castle
            dst.fix_y().clear_orthogonal().xy_constraint(not_55),
            cap.target_is(king).xy_constraint(not_55).xy_constraint((x,y) => !castle_adjacent_positions(x,y))
                .fix_y().max_manhattan_distance(1).teammate_at_unsigned_dx(1)
        ])
        .has_captures((dst, cap) => [
            // same as pawn captures above, only the king cannot be in or adjacent to the castle
            dst.fix_x().clear_orthogonal().xy_constraint(not_55),
            cap.target_is(king).xy_constraint(not_55).xy_constraint((x,y) => !castle_adjacent_positions(x,y))
                .fix_y().max_manhattan_distance(1).teammate_at_unsigned_dx(1)
        ])
        .has_captures((dst, cap) => [
            // same as pawn captures above, only the king cannot be in or adjacent to the castle
            dst.fix_x().clear_orthogonal().xy_constraint(not_55),
            cap.target_is(king).xy_constraint(not_55).xy_constraint((x,y) => !castle_adjacent_positions(x,y))
                .fix_x().max_manhattan_distance(1).teammate_at_unsigned_dy(1)
        ])
        .has_captures((dst, cap) => [
            // captures the king in the castle from above or below with teammates on all three other sides
            dst.clear_orthogonal().xy_constraint((x,y) => x == 5 && (y == 4 || y == 6)),
            cap.target_is(king).xy_constraint((x,y) => x == 5 && y == 5)
                .teammate_at_relative(1,0).teammate_at_relative(-1,0).teammate_at_unsigned_dy(1)
        ])
        .has_captures((dst, cap) => [
            // captures the king in the castle from left or right with teammates on all three other sides
            dst.clear_orthogonal().xy_constraint((x,y) => y == 5 && (x == 4 || x == 6)),
            cap.target_is(king).xy_constraint((x,y) => x == 5 && y == 5)
                .teammate_at_relative(0,1).teammate_at_relative(0,-1).teammate_at_unsigned_dx(1)
        ])
        .has_captures((dst, cap) => [
            // captures the king adjacent to castle
            dst.clear_orthogonal().xy_constraint((x,y) => Math.abs(x-5) == 1 && Math.abs(y-5) == 1),
            cap.target_is(king).xy_constraint(castle_adjacent_positions)
                .teammate_at_unsigned_dx(1).teammate_at_unsigned_dy(1)
        ])
        .has_captures((dst, cap) => [
            // captures the king adjacent to castle incoming vertically
            dst.clear_orthogonal().xy_constraint((x,y) => x == 5 && (y == 3 || y == 7)),
            cap.target_is(king).xy_constraint(castle_adjacent_positions)
                .teammate_at_signed_dx(1).teammate_at_signed_dx(-1)
        ])
        .has_captures((dst, cap) => [
            // captures the king adjacent to castle incoming horizontally
            dst.clear_orthogonal().xy_constraint((x,y) => y == 5 && (x == 3 || x == 7)),
            cap.target_is(king).xy_constraint(castle_adjacent_positions)
                .teammate_at_signed_dy(1).teammate_at_signed_dy(-1)
        ])

    board.add_piece(p => p.is(king).on_team(white).at(5, 5));

    board.add_piece(p => p.is(pawn).on_team(white).at(5, 3));
    board.add_piece(p => p.is(pawn).on_team(white).at(5, 4));
    board.add_piece(p => p.is(pawn).on_team(white).at(5, 6));
    board.add_piece(p => p.is(pawn).on_team(white).at(5, 7));
    board.add_piece(p => p.is(pawn).on_team(white).at(3, 5));
    board.add_piece(p => p.is(pawn).on_team(white).at(4, 5));
    board.add_piece(p => p.is(pawn).on_team(white).at(6, 5));
    board.add_piece(p => p.is(pawn).on_team(white).at(7, 5));

    board.add_piece(p => p.is(pawn).on_team(black).at(4, 1));
    board.add_piece(p => p.is(pawn).on_team(black).at(5, 1));
    board.add_piece(p => p.is(pawn).on_team(black).at(6, 1));
    board.add_piece(p => p.is(pawn).on_team(black).at(5, 2));
    board.add_piece(p => p.is(pawn).on_team(black).at(1, 4));
    board.add_piece(p => p.is(pawn).on_team(black).at(1, 5));
    board.add_piece(p => p.is(pawn).on_team(black).at(1, 6));
    board.add_piece(p => p.is(pawn).on_team(black).at(2, 5));
    board.add_piece(p => p.is(pawn).on_team(black).at(9, 4));
    board.add_piece(p => p.is(pawn).on_team(black).at(9, 5));
    board.add_piece(p => p.is(pawn).on_team(black).at(9, 6));
    board.add_piece(p => p.is(pawn).on_team(black).at(8, 5));
    board.add_piece(p => p.is(pawn).on_team(black).at(4, 9));
    board.add_piece(p => p.is(pawn).on_team(black).at(5, 9));
    board.add_piece(p => p.is(pawn).on_team(black).at(6, 9));
    board.add_piece(p => p.is(pawn).on_team(black).at(5, 8));

    return board;
}